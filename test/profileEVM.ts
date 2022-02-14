import { expect, ether } from '../testHelpers/prelude';
import { profileEVM, gasspectEVM } from '../testHelpers/profileEVM';

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

    describe('gasspectEVM', async function () {
        it('should be counted ERC20 Transfer', async function () {
            const receipt = await this.USDT.transfer(wallet2, ether('1'), { from: wallet1 });
            expect(await gasspectEVM(receipt.tx))
                .to.be.deep.equal(['0-0-SLOAD = 2100', '0-0-SSTORE = 2900', '0-0-SLOAD = 2100', '0-0-SSTORE = 2900', '0-0-LOG3 = 1756']);
        });

        it('should be counted ERC20 Approve', async function () {
            const receipt = await this.USDT.approve(wallet2, ether('1'), { from: wallet1 });
            expect(await gasspectEVM(receipt.tx))
                .to.be.deep.equal(['0-0-SSTORE = 2200', '0-0-LOG3 = 1756']);
        });

        it('should be counted ERC20 Transfer with minOpGasCost = 2000', async function () {
            const receipt = await this.USDT.transfer(wallet2, ether('1'), { from: wallet1 });
            expect(await gasspectEVM(receipt.tx, { minOpGasCost: 2000 }))
                .to.be.deep.equal(['0-0-SLOAD = 2100', '0-0-SSTORE = 2900', '0-0-SLOAD = 2100', '0-0-SSTORE = 2900']);
        });

        it('should be counted ERC20 Transfer with args', async function () {
            const receipt = await this.USDT.transfer(wallet2, ether('1'), { from: wallet1 });
            expect(await gasspectEVM(receipt.tx, { args: true }))
                .to.be.deep.equal([
                    '0-0-SLOAD(0x723077b8a1b173adc35e5f0e7e3662fd1208212cb629f9c128551ea7168da722) = 2100',
                    '0-0-SSTORE(0x723077b8a1b173adc35e5f0e7e3662fd1208212cb629f9c128551ea7168da722,0x0000000000000000000000000000000000000000000001450b3737d49a300000) = 2900',
                    '0-0-SLOAD(0x14e04a66bf74771820a7400ff6cf065175b3d7eb25805a5bd1633b161af5d101) = 2100',
                    '0-0-SSTORE(0x14e04a66bf74771820a7400ff6cf065175b3d7eb25805a5bd1633b161af5d101,0x0000000000000000000000000000000000000000000001457a3ced71d5500000) = 2900',
                    '0-0-LOG3() = 1756',
                ]);
        });

        it('should be counted ERC20 Transfer with res', async function () {
            const receipt = await this.USDT.transfer(wallet2, ether('1'), { from: wallet1 });
            expect(await gasspectEVM(receipt.tx, { res: true }))
                .to.be.deep.equal([
                    '0-0-SLOAD:0x00000000000000000000000000000000000000000000017b4100e59a78d00000 = 2100',
                    '0-0-SSTORE = 2900',
                    '0-0-SLOAD:0x00000000000000000000000000000000000000000000017bb0069b37b3f00000 = 2100',
                    '0-0-SSTORE = 2900',
                    '0-0-LOG3 = 1756',
                ]);
        });
    });
});
