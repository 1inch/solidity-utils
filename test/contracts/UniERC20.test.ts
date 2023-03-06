import { expect, constants, ether } from '../../src/prelude';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { formatBytes32String, getAddress } from 'ethers/lib/utils';

describe('UniERC20', function () {
    let signer1: SignerWithAddress;
    let signer2: SignerWithAddress;
    let signer3: SignerWithAddress;

    before(async function () {
        [signer1, signer2, signer3] = await ethers.getSigners();
    });

    describe('ERC20 token', function () {
        async function deployMocks() {
            const TokenMock = await ethers.getContractFactory('TokenMock');
            const token = await TokenMock.deploy('Token', 'TKN');
            await token.mint(signer1.address, ether('1000'));
            const UniERC20Wrapper = await ethers.getContractFactory('UniERC20Wrapper');
            const wrapper = await UniERC20Wrapper.deploy(token.address);
            return { token, wrapper };
        }

        it('is ETH', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            expect(await wrapper.isETH()).to.equal(false);
        });

        it('uni transfer', async function () {
            const { wrapper, token } = await loadFixture(deployMocks);
            await token.transfer(wrapper.address, 100);
            await wrapper.transfer(signer2.address, 100);
            expect(await wrapper.balanceOf(signer2.address)).to.be.equal(100);
        });

        it('uni transfer from', async function () {
            const { wrapper, token } = await loadFixture(deployMocks);
            await token.transfer(signer2.address, 100);
            await token.connect(signer2).approve(wrapper.address, 100);
            await wrapper.transferFrom(signer2.address, signer3.address, 100);
            expect(await wrapper.balanceOf(signer3.address)).to.be.equal(100);
        });

        it('uni approve', async function () {
            const { wrapper, token } = await loadFixture(deployMocks);
            await token.transfer(wrapper.address, 100);
            await wrapper.approve(signer1.address, 100);
            await token.transferFrom(wrapper.address, signer2.address, 100);
            expect(await wrapper.balanceOf(signer2.address)).to.be.equal(100);
        });

        describe('ERC20 NAME/SYMBOL', function () {
            it('uni name', async function () {
                const { wrapper } = await loadFixture(deployMocks);
                expect(await wrapper.name()).to.equal('Token');
            });

            it('uni symbol', async function () {
                const { wrapper } = await loadFixture(deployMocks);
                expect(await wrapper.symbol()).to.equal('TKN');
            });
        });
    });

    describe('ERC20 token, empty name/symbol', function () {
        async function deployMocks() {
            const TokenMock = await ethers.getContractFactory('TokenMock');
            const token = await TokenMock.deploy('', '');
            const UniERC20Wrapper = await ethers.getContractFactory('UniERC20Wrapper');
            const wrapper = await UniERC20Wrapper.deploy(token.address);
            return { token, wrapper };
        }

        it('uni name', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            expect(await wrapper.name()).to.equal('');
        });

        it('uni symbol', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            expect(await wrapper.symbol()).to.equal('');
        });
    });

    describe('ERC20 NAME/SYMBOL bytes32', function () {
        async function deployMocks() {
            const ERC20bytes32Capitals = await ethers.getContractFactory('ERC20bytes32Capitals');
            const token = await ERC20bytes32Capitals.deploy(formatBytes32String('Token'), formatBytes32String('TKN'));
            const UniERC20Wrapper = await ethers.getContractFactory('UniERC20Wrapper');
            const wrapper = await UniERC20Wrapper.deploy(token.address);
            return { token, wrapper };
        }

        it('uni name', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            expect(await wrapper.name()).to.equal('Token');
        });

        it('uni symbol', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            expect(await wrapper.symbol()).to.equal('TKN');
        });
    });

    describe('ERC20 name/symbol bytes32', function () {
        async function deployMocks() {
            const ERC20bytes32 = await ethers.getContractFactory('ERC20bytes32');
            const token = await ERC20bytes32.deploy(formatBytes32String('Token'), formatBytes32String('TKN'));
            const UniERC20Wrapper = await ethers.getContractFactory('UniERC20Wrapper');
            const wrapper = await UniERC20Wrapper.deploy(token.address);
            return { token, wrapper };
        }

        it('uni name', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            expect(await wrapper.name()).to.equal('Token');
        });

        it('uni symbol', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            expect(await wrapper.symbol()).to.equal('TKN');
        });
    });

    describe('ERC20 without name/symbol', function () {
        async function deployMocks() {
            const UniERC20Wrapper = await ethers.getContractFactory('UniERC20Wrapper');
            const wrapper = await UniERC20Wrapper.deploy(signer1.address);
            return { wrapper };
        }

        it('uni name', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            expect(getAddress(await wrapper.name())).to.equal(signer1.address);
        });

        it('uni symbol', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            expect(getAddress(await wrapper.symbol())).to.equal(signer1.address);
        });
    });

    describe('ETH', function () {
        async function deployMocks() {
            const UniERC20Wrapper = await ethers.getContractFactory('UniERC20Wrapper');
            const wrapper = await UniERC20Wrapper.deploy(constants.ZERO_ADDRESS);
            return { wrapper };
        }

        it('is ETH', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            expect(await wrapper.isETH()).to.equal(true);
        });

        it('uni transfer', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            const balBefore = await wrapper.balanceOf(signer2.address);
            await wrapper.transfer(signer2.address, 100, { value: 100 });
            const balAfter = await wrapper.balanceOf(signer2.address);
            expect(balAfter.toBigInt() - balBefore.toBigInt()).to.be.equal(100);
        });

        it('uni transfer, msg.value > amount', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            const balBefore = await wrapper.balanceOf(signer2.address);
            await wrapper.transfer(signer2.address, 100, { value: 101 });
            const balAfter = await wrapper.balanceOf(signer2.address);
            expect(balAfter.toBigInt() - balBefore.toBigInt()).to.be.equal(100);
        });

        it('uni transfer, insufficient balance', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            await expect(wrapper.transfer(signer2.address, 100, { value: 99 })).to.be.rejectedWith(
                'InsufficientBalance',
            );
        });

        it('uni approve must fail', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            await expect(wrapper.connect(signer2).approve(signer1.address, 100)).to.be.rejectedWith(
                'ApproveCalledOnETH',
            );
        });

        it('uni transfer from, success', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            const balBefore = await wrapper.balanceOf(wrapper.address);
            await wrapper.transferFrom(signer1.address, wrapper.address, 100, { value: 100 });
            const balAfter = await wrapper.balanceOf(wrapper.address);
            expect(balAfter.toBigInt() - balBefore.toBigInt()).to.be.equal(100);
        });

        it('uni transfer from, fail, not sender', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            await expect(
                wrapper.connect(signer2).transferFrom(signer1.address, wrapper.address, 100, { value: 100 }),
            ).to.be.rejectedWith('FromIsNotSender');
        });

        it('uni transfer from, fail, receiver is not contract', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            await expect(
                wrapper.transferFrom(signer1.address, signer2.address, 100, {
                    value: 100,
                }),
            ).to.be.rejectedWith('ToIsNotThis');
        });

        it('uni name', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            expect(await wrapper.name()).to.equal('ETH');
        });

        it('uni symbol', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            expect(await wrapper.symbol()).to.equal('ETH');
        });
    });

    describe('ETH with bad ether receiver', function () {
        async function deployMocks() {
            const UniERC20Wrapper = await ethers.getContractFactory('UniERC20Wrapper');
            const wrapper = await UniERC20Wrapper.deploy(constants.ZERO_ADDRESS);
            const ETHBadReceiver = await ethers.getContractFactory('ETHBadReceiver');
            const receiver = await ETHBadReceiver.deploy(constants.ZERO_ADDRESS, wrapper.address);
            return { wrapper, receiver };
        }

        it('uni failed transfer @skip-on-coverage ', async function () {
            const { wrapper, receiver } = await loadFixture(deployMocks);
            await expect(
                wrapper.transfer(receiver.address, 100, {
                    value: 100,
                }),
            ).to.eventually.be.rejectedWith('ETHTransferFailed');
        });

        it('uni failed transferFrom @skip-on-coverage ', async function () {
            const { wrapper, receiver } = await loadFixture(deployMocks);
            await expect(
                receiver.transfer(wrapper.address, 100, {
                    value: 101n,
                }),
            ).to.eventually.be.rejectedWith('ETHTransferFailed');
        });
    });

    describe('ETH from special address', function () {
        async function deployMocks() {
            const UniERC20Wrapper = await ethers.getContractFactory('UniERC20Wrapper');
            const wrapper = await UniERC20Wrapper.deploy('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');
            return { wrapper };
        }

        it('is ETH', async function () {
            const { wrapper } = await loadFixture(deployMocks);
            expect(await wrapper.isETH()).to.equal(true);
        });
    });
});
