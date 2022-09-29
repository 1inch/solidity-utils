import { constants, expect } from '../../src/prelude';

const ERC20ReturnFalseMock = artifacts.require('ERC20ReturnFalseMock');
const ERC20ReturnTrueMock = artifacts.require('ERC20ReturnTrueMock');
const ERC20NoReturnMock = artifacts.require('ERC20NoReturnMock');
const ERC20PermitNoRevertMock = artifacts.require('ERC20PermitNoRevertMock');
const SafeERC20Wrapper = artifacts.require('SafeERC20Wrapper');
const ERC20ThroughZeroApprove = artifacts.require('ERC20ThroughZeroApprove');

const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
];

const Permit = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
];

import { fromRpcSig } from 'ethereumjs-util';
import Wallet from 'ethereumjs-wallet';
import { signWithPk } from '../../src';

contract('SafeERC20', function (accounts) {
    const [hasNoCode] = accounts;

    describe.skip('with address that has no contract code', function () {
        beforeEach(async function () {
            this.wrapper = await SafeERC20Wrapper.new(hasNoCode);
        });

        shouldRevertOnAllCalls([
            'Address: call to non-contract',
            'Address: call to non-contract',
            'Address: call to non-contract',
        ]);
    });

    describe('with token that returns false on all calls', function () {
        beforeEach(async function () {
            this.wrapper = await SafeERC20Wrapper.new((await ERC20ReturnFalseMock.new()).address);
        });

        shouldRevertOnAllCalls(['SafeTransferFailed()', 'SafeTransferFromFailed()', 'ForceApproveFailed()']);
    });

    describe('with token that returns true on all calls', function () {
        beforeEach(async function () {
            this.wrapper = await SafeERC20Wrapper.new((await ERC20ReturnTrueMock.new()).address);
        });

        shouldOnlyRevertOnErrors();
    });

    describe('with token that returns no boolean values', function () {
        beforeEach(async function () {
            this.wrapper = await SafeERC20Wrapper.new((await ERC20NoReturnMock.new()).address);
        });

        shouldOnlyRevertOnErrors();
    });

    describe('non-zero to non-zero approval forbidden', function () {
        beforeEach(async function () {
            this.wrapper = await SafeERC20Wrapper.new((await ERC20ThroughZeroApprove.new()).address);
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
        const wallet = Wallet.generate();
        const owner = wallet.getAddressString();
        const spender = hasNoCode;

        beforeEach(async function () {
            this.token = await ERC20PermitNoRevertMock.new();
            this.wrapper = await SafeERC20Wrapper.new(this.token.address);

            const chainId = await this.token.getChainId();

            this.data = {
                primaryType: 'Permit',
                types: { EIP712Domain, Permit },
                domain: {
                    name: 'ERC20PermitNoRevertMock',
                    version: '1',
                    chainId,
                    verifyingContract: this.token.address,
                },
                message: {
                    owner,
                    spender,
                    value: '42',
                    nonce: '0',
                    deadline: constants.MAX_UINT256,
                },
            };
            this.signature = fromRpcSig(signWithPk(wallet.getPrivateKey(), this.data));
        });

        it('accepts owner signature', async function () {
            expect(await this.token.nonces(owner)).to.be.bignumber.equal('0');
            expect(await this.token.allowance(owner, spender)).to.be.bignumber.equal('0');

            await this.wrapper.permit(
                this.data.message.owner,
                this.data.message.spender,
                this.data.message.value,
                this.data.message.deadline,
                this.signature.v,
                this.signature.r,
                this.signature.s,
            );

            expect(await this.token.nonces(owner)).to.be.bignumber.equal('1');
            expect(await this.token.allowance(owner, spender)).to.be.bignumber.equal(this.data.message.value);
        });

        it('revert on reused signature', async function () {
            expect(await this.token.nonces(owner)).to.be.bignumber.equal('0');
            // use valid signature and consume nounce
            await this.wrapper.permit(
                this.data.message.owner,
                this.data.message.spender,
                this.data.message.value,
                this.data.message.deadline,
                this.signature.v,
                this.signature.r,
                this.signature.s,
            );
            expect(await this.token.nonces(owner)).to.be.bignumber.equal('1');
            // invalid call does not revert for this token implementation
            await this.token.permit(
                this.data.message.owner,
                this.data.message.spender,
                this.data.message.value,
                this.data.message.deadline,
                this.signature.v,
                this.signature.r,
                this.signature.s,
            );
            expect(await this.token.nonces(owner)).to.be.bignumber.equal('1');
            // ignore invalid call when called through the SafeERC20 library
            await this.wrapper.permit(
                this.data.message.owner,
                this.data.message.spender,
                this.data.message.value,
                this.data.message.deadline,
                this.signature.v,
                this.signature.r,
                this.signature.s,
            );
            expect(await this.token.nonces(owner)).to.be.bignumber.equal('1');
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
                this.data.message.owner,
                this.data.message.spender,
                this.data.message.value,
                this.data.message.deadline,
                invalidSignature.v,
                invalidSignature.r,
                invalidSignature.s,
            );

            // ignores call revert when called through the SafeERC20 library
            await this.wrapper.permit(
                this.data.message.owner,
                this.data.message.spender,
                this.data.message.value,
                this.data.message.deadline,
                invalidSignature.v,
                invalidSignature.r,
                invalidSignature.s,
            );
        });
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
