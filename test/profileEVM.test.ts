import { ether } from '../src/prelude';
import { expect } from '../src/expect';
import { profileEVM, gasspectEVM } from '../src/profileEVM';
import hre, { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('trace inspection', function () {
    let signer1: SignerWithAddress;
    let signer2: SignerWithAddress;

    before(async function () {
        [signer1, signer2] = await ethers.getSigners();
    });

    async function deployUSDT() {
        const TokenMock = await ethers.getContractFactory('TokenMock');
        const usdt = await TokenMock.deploy('USDT', 'USDT');
        await usdt.mint(signer1, ether('1000'));
        await usdt.mint(signer2, ether('1000'));
        return { usdt };
    }

    describe('profileEVM', function () {
        it('should be counted ERC20 Transfer', async function () {
            const { usdt } = await loadFixture(deployUSDT);

            const txn = await usdt.transfer(signer2, ether('1'));
            if (hre.__SOLIDITY_COVERAGE_RUNNING === undefined) {
                expect(await profileEVM(ethers.provider, txn.hash, ['STATICCALL', 'CALL', 'SSTORE', 'SLOAD'])).to.be.deep.equal([
                    0, 0, 2, 2,
                ]);
            }
        });

        it('should be counted ERC20 Approve', async function () {
            const { usdt } = await loadFixture(deployUSDT);

            const txn = await usdt.approve(signer2, ether('1'));
            if (hre.__SOLIDITY_COVERAGE_RUNNING === undefined) {
                expect(await profileEVM(ethers.provider, txn.hash, ['STATICCALL', 'CALL', 'SSTORE', 'SLOAD'])).to.be.deep.equal([
                    0, 0, 1, 0,
                ]);
            }
        });
    });

    describe('gasspectEVM', function () {
        it('should be counted ERC20 Transfer', async function () {
            const { usdt } = await loadFixture(deployUSDT);

            const txn = await usdt.transfer(signer2, ether('1'));
            expect(await gasspectEVM(ethers.provider, txn.hash)).to.be.deep.equal([
                '0-0-SLOAD = 2100',
                '0-0-SSTORE = 2900',
                '0-0-SLOAD = 2100',
                '0-0-SSTORE = 2900',
                '0-0-LOG3 = 1756',
            ]);
        });

        it('should be counted ERC20 Approve', async function () {
            const { usdt } = await loadFixture(deployUSDT);

            const txn = await usdt.approve(signer2, ether('1'));
            if (hre.__SOLIDITY_COVERAGE_RUNNING === undefined) {
                expect(await gasspectEVM(ethers.provider, txn.hash)).to.be.deep.equal(['0-0-SSTORE_I = 22100', '0-0-LOG3 = 1756']);
            }
        });

        it('should be counted ERC20 Transfer with minOpGasCost = 2000', async function () {
            const { usdt } = await loadFixture(deployUSDT);

            const txn = await usdt.transfer(signer2, ether('1'));
            expect(await gasspectEVM(ethers.provider, txn.hash, { minOpGasCost: 2000 })).to.be.deep.equal([
                '0-0-SLOAD = 2100',
                '0-0-SSTORE = 2900',
                '0-0-SLOAD = 2100',
                '0-0-SSTORE = 2900',
            ]);
        });

        it('should be counted ERC20 Transfer with args', async function () {
            const { usdt } = await loadFixture(deployUSDT);

            const txn = await usdt.transfer(signer2, ether('1'));
            if (hre.__SOLIDITY_COVERAGE_RUNNING === undefined) {
                expect(await gasspectEVM(ethers.provider, txn.hash, { args: true })).to.be.deep.equal([
                    '0-0-SLOAD(0x723077b8a1b173adc35e5f0e7e3662fd1208212cb629f9c128551ea7168da722) = 2100',
                    '0-0-SSTORE(0x723077b8a1b173adc35e5f0e7e3662fd1208212cb629f9c128551ea7168da722,0x00000000000000000000000000000000000000000000003627e8f712373c0000) = 2900',
                    '0-0-SLOAD(0x14e04a66bf74771820a7400ff6cf065175b3d7eb25805a5bd1633b161af5d101) = 2100',
                    '0-0-SSTORE(0x14e04a66bf74771820a7400ff6cf065175b3d7eb25805a5bd1633b161af5d101,0x00000000000000000000000000000000000000000000003643aa647986040000) = 2900',
                    '0-0-LOG3() = 1756',
                ]);
            }
        });

        it('should be counted ERC20 Transfer with res', async function () {
            const { usdt } = await loadFixture(deployUSDT);

            const txn = await usdt.transfer(signer2, ether('1'));
            if (hre.__SOLIDITY_COVERAGE_RUNNING === undefined) {
                expect(await gasspectEVM(ethers.provider, txn.hash, { res: true })).to.be.deep.equal([
                    '0-0-SLOAD:0x00000000000000000000000000000000000000000000003635c9adc5dea00000 = 2100',
                    '0-0-SSTORE = 2900',
                    '0-0-SLOAD:0x00000000000000000000000000000000000000000000003635c9adc5dea00000 = 2100',
                    '0-0-SSTORE = 2900',
                    '0-0-LOG3 = 1756',
                ]);
            }
        });
    });
});
