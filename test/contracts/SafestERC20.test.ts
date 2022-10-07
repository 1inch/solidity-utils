import { constants, expect } from '../../src/prelude';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { Contract, ContractFactory } from 'ethers';

const Permit = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
];

describe('SafeERC20', async () => {
    let owner: SignerWithAddress;
    let spender: SignerWithAddress;
    let SafeERC20Wrapper: ContractFactory;

    before(async () => {
        [owner, spender] = await ethers.getSigners();
        SafeERC20Wrapper = await ethers.getContractFactory('SafeERC20Wrapper');
    });

    const deployWrapperSimple = async () => {
        const wrapper = await SafeERC20Wrapper.deploy(spender.address);
        await wrapper.deployed();
        return { wrapper };
    };

    const deployWrapperFalseMock = async () => {
        const ERC20ReturnFalseMock = await ethers.getContractFactory('ERC20ReturnFalseMock');
        const falseMock = await ERC20ReturnFalseMock.deploy();
        await falseMock.deployed();
        const wrapper = await SafeERC20Wrapper.deploy(falseMock.address);
        await wrapper.deployed();
        return { wrapper };
    };

    const deployWrapperTrueMock = async () => {
        const ERC20ReturnTrueMock = await ethers.getContractFactory('ERC20ReturnTrueMock');
        const trueMock = await ERC20ReturnTrueMock.deploy();
        await trueMock.deployed();
        const wrapper = await SafeERC20Wrapper.deploy(trueMock.address);
        await wrapper.deployed();
        return { wrapper };
    };

    const deployWrapperNoReturnMock = async () => {
        const ERC20NoReturnMock = await ethers.getContractFactory('ERC20NoReturnMock');
        const noReturnMock = await ERC20NoReturnMock.deploy();
        await noReturnMock.deployed();
        const wrapper = await SafeERC20Wrapper.deploy(noReturnMock.address);
        await wrapper.deployed();
        return { wrapper };
    };

    const deployWrapperZeroApprove = async () => {
        const ERC20ThroughZeroApprove = await ethers.getContractFactory('ERC20ThroughZeroApprove');
        const zeroApprove = await ERC20ThroughZeroApprove.deploy();
        await zeroApprove.deployed();
        const wrapper = await SafeERC20Wrapper.deploy(zeroApprove.address);
        await wrapper.deployed();
        return { wrapper };
    };

    const deployPermitNoRevertAndSign = async () => {
        const ERC20PermitNoRevertMock = await ethers.getContractFactory('ERC20PermitNoRevertMock');
        const token = await ERC20PermitNoRevertMock.deploy();
        await token.deployed();
        const wrapper = await SafeERC20Wrapper.deploy(token.address);
        await wrapper.deployed();

        const chainId = await token.getChainId();

        const domain = {
            name: 'ERC20PermitNoRevertMock',
            version: '1',
            chainId,
            verifyingContract: token.address,
        };
        const data = {
            owner: owner.address,
            spender: spender.address,
            value: '42',
            nonce: '0',
            deadline: constants.MAX_UINT256,
        };
        //console.log(data);
        const signature = ethers.utils.splitSignature(await owner._signTypedData(domain, { Permit }, data));
        return { token, wrapper, data, signature };
    };

    describe('with address that has no contract code', async () => {
        shouldRevertOnAllCalls(
            ['SafeTransferFailed', 'SafeTransferFromFailed', 'ForceApproveFailed', ''],
            deployWrapperSimple,
        );
    });

    describe('with token that returns false on all calls', async () => {
        shouldRevertOnAllCalls(
            ['SafeTransferFailed', 'SafeTransferFromFailed', 'ForceApproveFailed'],
            deployWrapperFalseMock,
        );
    });

    describe('with token that returns true on all calls', async () => {
        shouldOnlyRevertOnErrors(deployWrapperTrueMock);
    });

    describe('with token that returns no boolean values', async () => {
        shouldOnlyRevertOnErrors(deployWrapperNoReturnMock);
    });

    describe('non-zero to non-zero approval forbidden', async () => {
        it('zero to non-zero approval should pass', async () => {
            const { wrapper } = await loadFixture(deployWrapperZeroApprove);
            await wrapper.approve(100);
        });

        it('non-zero to non-zero approval should pass', async () => {
            const { wrapper } = await loadFixture(deployWrapperZeroApprove);
            await wrapper.approve(100);
            await wrapper.approve(100);
        });

        it('non-zero to zero to non-zero approval should pass', async () => {
            const { wrapper } = await loadFixture(deployWrapperZeroApprove);
            await wrapper.approve(100);
            await wrapper.approve(0);
            await wrapper.approve(100);
        });
    });

    describe("with token that doesn't revert on invalid permit", async () => {
        it('accepts owner signature', async () => {
            const { token, wrapper, data, signature } = await loadFixture(deployPermitNoRevertAndSign);
            expect(await token.nonces(owner.address)).to.equal('0');
            expect(await token.allowance(owner.address, spender.address)).to.equal('0');

            await wrapper.permit(
                data.owner,
                data.spender,
                data.value,
                data.deadline,
                signature.v,
                signature.r,
                signature.s,
            );

            expect(await token.nonces(owner.address)).to.equal('1');
            expect(await token.allowance(owner.address, spender.address)).to.equal(data.value);
        });

        it('revert on reused signature', async () => {
            const { token, wrapper, data, signature } = await loadFixture(deployPermitNoRevertAndSign);
            expect(await token.nonces(owner.address)).to.equal('0');
            // use valid signature and consume nounce
            await wrapper.permit(
                data.owner,
                data.spender,
                data.value,
                data.deadline,
                signature.v,
                signature.r,
                signature.s,
            );
            expect(await token.nonces(owner.address)).to.equal('1');
            // invalid call does not revert for this token implementation
            await token.permit(
                data.owner,
                data.spender,
                data.value,
                data.deadline,
                signature.v,
                signature.r,
                signature.s,
            );
            expect(await token.nonces(owner.address)).to.equal('1');
            // ignore invalid call when called through the SafeERC20 library
            await wrapper.permit(
                data.owner,
                data.spender,
                data.value,
                data.deadline,
                signature.v,
                signature.r,
                signature.s,
            );
            expect(await token.nonces(owner.address)).to.equal('1');
        });

        it('revert on invalid signature', async () => {
            const { token, wrapper, data } = await loadFixture(deployPermitNoRevertAndSign);
            // signature that is not valid for owner
            const invalidSignature = {
                v: 27,
                r: '0x71753dc5ecb5b4bfc0e3bc530d79ce5988760ed3f3a234c86a5546491f540775',
                s: '0x0049cedee5aed990aabed5ad6a9f6e3c565b63379894b5fa8b512eb2b79e485d',
            };

            // invalid call does not revert for this token implementation
            await token.permit(
                data.owner,
                data.spender,
                data.value,
                data.deadline,
                invalidSignature.v,
                invalidSignature.r,
                invalidSignature.s,
            );

            // ignores call revert when called through the SafeERC20 library
            await wrapper.permit(
                data.owner,
                data.spender,
                data.value,
                data.deadline,
                invalidSignature.v,
                invalidSignature.r,
                invalidSignature.s,
            );
        });
    });

    function shouldRevertOnAllCalls(reasons: string[], fixture: () => Promise<{ wrapper: Contract }>) {
        it('reverts on transfer', async () => {
            const { wrapper } = await loadFixture(fixture);
            await expect(wrapper.transfer()).to.be.revertedWithCustomError(wrapper, reasons[0]);
        });

        it('reverts on transferFrom', async () => {
            const { wrapper } = await loadFixture(fixture);
            await expect(wrapper.transferFrom()).to.be.revertedWithCustomError(wrapper, reasons[1]);
        });

        it('reverts on approve', async () => {
            const { wrapper } = await loadFixture(fixture);
            await expect(wrapper.approve(0)).to.be.revertedWithCustomError(wrapper, reasons[2]);
        });

        it('reverts on increaseAllowance', async () => {
            const { wrapper } = await loadFixture(fixture);
            if (reasons.length === 3) {
                await expect(wrapper.increaseAllowance(0)).to.be.revertedWithCustomError(wrapper, reasons[2]);
            } else {
                await expect(wrapper.increaseAllowance(0)).to.be.reverted;
            }
        });

        it('reverts on decreaseAllowance', async () => {
            const { wrapper } = await loadFixture(fixture);
            if (reasons.length === 3) {
                await expect(wrapper.decreaseAllowance(0)).to.be.revertedWithCustomError(wrapper, reasons[2]);
            } else {
                await expect(wrapper.decreaseAllowance(0)).to.be.reverted;
            }
        });
    }

    function shouldOnlyRevertOnErrors(fixture: () => Promise<{ wrapper: Contract }>) {
        it("doesn't revert on transfer", async () => {
            const { wrapper } = await loadFixture(fixture);
            await wrapper.transfer();
        });

        it("doesn't revert on transferFrom", async () => {
            const { wrapper } = await loadFixture(fixture);
            await wrapper.transferFrom();
        });

        describe('approvals', function () {
            describe('with zero allowance', async () => {
                it("doesn't revert when approving a non-zero allowance", async () => {
                    const { wrapper } = await loadFixture(fixture);
                    await wrapper.approve(100);
                });

                it("doesn't revert when approving a zero allowance", async () => {
                    const { wrapper } = await loadFixture(fixture);
                    await wrapper.approve(0);
                });

                it("doesn't revert when increasing the allowance", async () => {
                    const { wrapper } = await loadFixture(fixture);
                    await wrapper.increaseAllowance(10);
                });

                it('reverts when decreasing the allowance', async () => {
                    const { wrapper } = await loadFixture(fixture);
                    await expect(wrapper.decreaseAllowance(10)).to.be.revertedWithCustomError(
                        wrapper,
                        'SafeDecreaseAllowanceFailed',
                    );
                });
            });

            describe('with non-zero allowance', async () => {
                it("doesn't revert when approving a non-zero allowance", async () => {
                    const { wrapper } = await loadFixture(fixture);
                    await wrapper.setAllowance(100);
                    await wrapper.approve(20);
                });

                it("doesn't revert when approving a zero allowance", async () => {
                    const { wrapper } = await loadFixture(fixture);
                    await wrapper.setAllowance(100);
                    await wrapper.approve(0);
                });

                it("doesn't revert when increasing the allowance", async () => {
                    const { wrapper } = await loadFixture(fixture);
                    await wrapper.setAllowance(100);
                    await wrapper.increaseAllowance(10);
                });

                it("doesn't revert when decreasing the allowance to a positive value", async () => {
                    const { wrapper } = await loadFixture(fixture);
                    await wrapper.setAllowance(100);
                    await wrapper.decreaseAllowance(50);
                });

                it('reverts when decreasing the allowance to a negative value', async () => {
                    const { wrapper } = await loadFixture(fixture);
                    await wrapper.setAllowance(100);
                    await expect(wrapper.decreaseAllowance(200)).to.be.revertedWithCustomError(
                        wrapper,
                        'SafeDecreaseAllowanceFailed',
                    );
                });
            });
        });
    }
});
