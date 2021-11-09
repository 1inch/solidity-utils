const { expect } = require('chai');
const { profileEVM } = require('../js/profileEVM.js');
const { ether } = require('@openzeppelin/test-helpers');

const TokenMock = artifacts.require('TokenMock');

contract('', function ([wallet1, wallet2]) {
    before(async function () {
        this.USDT = await TokenMock.new('USDT', 'USDT');
    });

    beforeEach(async function () {
        for (const addr of [wallet1, wallet2]) {
            await this.USDT.mint(addr, ether('1000'));
        }
    });

    describe('profileEVM', async function () {
        it('should be counted ERC20 Transfer', async function () {
            const receipt = await this.USDT.transfer(wallet2, ether('1'), { from: wallet1 });
            expect(await profileEVM(receipt.tx, ['STATICCALL', 'CALL', 'SSTORE', 'SLOAD']))
                .to.be.deep.equal([0, 0, 2, 2]);
        });

        it('should be counted ERC20 Approve', async function () {
            const receipt = await this.USDT.approve(wallet2, ether('1'), { from: wallet1 });
            expect(await profileEVM(receipt.tx, ['STATICCALL', 'CALL', 'SSTORE', 'SLOAD']))
                .to.be.deep.equal([0, 0, 1, 0]);
        });
    });

    // describe('gasspectEVM', async function () {
    //     it.only('should be counted ERC20 Transfer', async function () {
    //         const receipt = await this.USDT.transfer(wallet2, ether('1'), { from: wallet1 });
    //         expect(await gasspectEVM(receipt.tx))
    //             .to.be.deep.equal(['0-0-SLOAD = 2100', '0-0-SSTORE = 2900', '0-0-SLOAD = 2100', '0-0-SSTORE = 2900', '0-0-LOG3 = 1756']);
    //     });

    //     it('should be counted ERC20 Approve', async function () {
    //         const receipt = await this.USDT.approve(wallet2, ether('1'), { from: wallet1 });
    //         expect(await gasspectEVM(receipt.tx))
    //             .to.be.deep.equal(['0-0-SSTORE = 2200', '0-0-LOG3 = 1756']);
    //     });
    // });
});
