import { constants, expect } from '../../src/prelude';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';

const Permit = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
];

contract('SafeERC20', function () {
    let owner: SignerWithAddress;
    let spender: SignerWithAddress;

    before(async function () {
        [owner, spender] = await ethers.getSigners();

        this.SafeERC20Wrapper = await ethers.getContractFactory('SafeERC20Wrapper');
        this.ERC20ReturnFalseMock = await ethers.getContractFactory('ERC20ReturnFalseMock');
        this.ERC20ThroughZeroApprove = await ethers.getContractFactory('ERC20ThroughZeroApprove');
        this.ERC20ReturnTrueMock = await ethers.getContractFactory('ERC20ReturnTrueMock');
        this.ERC20NoReturnMock = await ethers.getContractFactory('ERC20NoReturnMock');
        this.ERC20PermitNoRevertMock = await ethers.getContractFactory('ERC20PermitNoRevertMock');
    });

    describe('with token that returns false on all calls', function () {
        beforeEach(async function () {
            this.falseMock = await this.ERC20ReturnFalseMock.deploy();
            await this.falseMock.deployed();
            this.wrapper = await this.SafeERC20Wrapper.deploy(this.falseMock.address);
        });

        shouldRevertOnAllCalls(['SafeTransferFailed()', 'SafeTransferFromFailed()', 'ForceApproveFailed()']);
    });

    describe('with token that returns true on all calls', function () {
        beforeEach(async function () {
            this.trueMock = await this.ERC20ReturnTrueMock.deploy();
            await this.trueMock.deployed();
            this.wrapper = await this.SafeERC20Wrapper.deploy(this.trueMock.address);
        });

        shouldOnlyRevertOnErrors();
    });

    describe('with token that returns no boolean values', function () {
        beforeEach(async function () {
            this.noReturnMock = await this.ERC20NoReturnMock.deploy();
            await this.noReturnMock.deployed();
            this.wrapper = await this.SafeERC20Wrapper.deploy(this.noReturnMock.address);
        });

        shouldOnlyRevertOnErrors();
    });

    describe('non-zero to non-zero approval forbidden', function () {
        beforeEach(async function () {
            this.zeroApprove = await this.ERC20ThroughZeroApprove.deploy();
            await this.zeroApprove.deployed();
            this.wrapper = await this.SafeERC20Wrapper.deploy(this.zeroApprove.address);
        });

        it('zero to non-zero approval should pass', async function () {
            await this.wrapper.approve(100);
        });

        it('non-zero to non-zero approval should pass', async function () {
            await this.wrapper.approve(100);
            await this.wrapper.approve(100);
        });

        it('non-zero to zero to non-zero approval should pass', async function () {
            await this.wrapper.approve(100);
            await this.wrapper.approve(0);
            await this.wrapper.approve(100);
        });
    });

    describe("with token that doesn't revert on invalid permit", function () {
        beforeEach(async function () {
            this.token = await this.ERC20PermitNoRevertMock.deploy();
            await this.token.deployed();
            this.wrapper = await this.SafeERC20Wrapper.deploy(this.token.address);

            const chainId = await this.token.getChainId();

            this.domain = {
                name: 'ERC20PermitNoRevertMock',
                version: '1',
                chainId,
                verifyingContract: this.token.address,
            };
            this.data = {
                owner: owner.address,
                spender: spender.address,
                value: '42',
                nonce: '0',
                deadline: constants.MAX_UINT256,
            };
            //console.log(this.data);
            this.signature = ethers.utils.splitSignature(
                await owner._signTypedData(this.domain, { Permit }, this.data),
            );
        });

        it('accepts owner signature', async function () {
            expect(await this.token.nonces(owner.address)).to.equal('0');
            expect(await this.token.allowance(owner.address, spender.address)).to.equal('0');

            await this.wrapper.permit(
                this.data.owner,
                this.data.spender,
                this.data.value,
                this.data.deadline,
                this.signature.v,
                this.signature.r,
                this.signature.s,
            );

            expect(await this.token.nonces(owner.address)).to.equal('1');
            expect(await this.token.allowance(owner.address, spender.address)).to.equal(this.data.value);
        });

        it('revert on reused signature', async function () {
            expect(await this.token.nonces(owner.address)).to.equal('0');
            // use valid signature and consume nounce
            await this.wrapper.permit(
                this.data.owner,
                this.data.spender,
                this.data.value,
                this.data.deadline,
                this.signature.v,
                this.signature.r,
                this.signature.s,
            );
            expect(await this.token.nonces(owner.address)).to.equal('1');
            // invalid call does not revert for this token implementation
            await this.token.permit(
                this.data.owner,
                this.data.spender,
                this.data.value,
                this.data.deadline,
                this.signature.v,
                this.signature.r,
                this.signature.s,
            );
            expect(await this.token.nonces(owner.address)).to.equal('1');
            // ignore invalid call when called through the SafeERC20 library
            await this.wrapper.permit(
                this.data.owner,
                this.data.spender,
                this.data.value,
                this.data.deadline,
                this.signature.v,
                this.signature.r,
                this.signature.s,
            );
            expect(await this.token.nonces(owner.address)).to.equal('1');
        });

        it('revert on invalid signature', async function () {
            // signature that is not valid for owner
            const invalidSignature = {
                v: 27,
                r: '0x71753dc5ecb5b4bfc0e3bc530d79ce5988760ed3f3a234c86a5546491f540775',
                s: '0x0049cedee5aed990aabed5ad6a9f6e3c565b63379894b5fa8b512eb2b79e485d',
            };

            // invalid call does not revert for this token implementation
            await this.token.permit(
                this.data.owner,
                this.data.spender,
                this.data.value,
                this.data.deadline,
                invalidSignature.v,
                invalidSignature.r,
                invalidSignature.s,
            );

            // ignores call revert when called through the SafeERC20 library
            await this.wrapper.permit(
                this.data.owner,
                this.data.spender,
                this.data.value,
                this.data.deadline,
                invalidSignature.v,
                invalidSignature.r,
                invalidSignature.s,
            );
        });
    });

    function shouldRevertOnAllCalls(reasons: string[]) {
        it('reverts on transfer', async function () {
            await expect(this.wrapper.transfer()).to.eventually.be.rejectedWith(reasons[0]);
        });

        it('reverts on transferFrom', async function () {
            await expect(this.wrapper.transferFrom()).to.eventually.be.rejectedWith(reasons[1]);
        });

        it('reverts on approve', async function () {
            await expect(this.wrapper.approve(0)).to.eventually.be.rejectedWith(reasons[2]);
        });

        it('reverts on increaseAllowance', async function () {
            // [TODO] make sure it's reverting for the right reason
            // await expect(this.wrapper.increaseAllowance(0)).to.eventually.be.rejectedWith('');
        });

        it('reverts on decreaseAllowance', async function () {
            // [TODO] make sure it's reverting for the right reason
            // await expect(this.wrapper.decreaseAllowance(0)).to.eventually.be.rejectedWith('');
        });
    }

    function shouldOnlyRevertOnErrors() {
        it("doesn't revert on transfer", async function () {
            await this.wrapper.transfer();
        });

        it("doesn't revert on transferFrom", async function () {
            await this.wrapper.transferFrom();
        });

        describe('approvals', function () {
            context('with zero allowance', function () {
                beforeEach(async function () {
                    await this.wrapper.setAllowance(0);
                });

                it("doesn't revert when approving a non-zero allowance", async function () {
                    await this.wrapper.approve(100);
                });

                it("doesn't revert when approving a zero allowance", async function () {
                    await this.wrapper.approve(0);
                });

                it("doesn't revert when increasing the allowance", async function () {
                    await this.wrapper.increaseAllowance(10);
                });

                it('reverts when decreasing the allowance', async function () {
                    await expect(this.wrapper.decreaseAllowance(10)).to.eventually.be.rejectedWith(
                        'SafeDecreaseAllowanceFailed()',
                    );
                });
            });

            context('with non-zero allowance', function () {
                beforeEach(async function () {
                    await this.wrapper.setAllowance(100);
                });

                it("doesn't revert when approving a non-zero allowance", async function () {
                    await this.wrapper.approve(20);
                });

                it("doesn't revert when approving a zero allowance", async function () {
                    await this.wrapper.approve(0);
                });

                it("doesn't revert when increasing the allowance", async function () {
                    await this.wrapper.increaseAllowance(10);
                });

                it("doesn't revert when decreasing the allowance to a positive value", async function () {
                    await this.wrapper.decreaseAllowance(50);
                });

                it('reverts when decreasing the allowance to a negative value', async function () {
                    await expect(this.wrapper.decreaseAllowance(200)).to.eventually.be.rejectedWith(
                        'SafeDecreaseAllowanceFailed()',
                    );
                });
            });
        });
    }
});
