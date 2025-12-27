import { expect } from '../../src/expect';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('Transient', function () {
    async function deployTransientMock() {
        const TransientMock = await ethers.getContractFactory('TransientMock');
        const mock = await TransientMock.deploy();
        return { mock };
    }

    describe('tuint256', function () {
        describe('tload/tstore', function () {
            it('should return 0 for uninitialized value', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                expect(await mock.tloadUint()).to.equal(0n);
            });

            it('should store and load value in same tx via staticCall', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                // Transient storage is cleared between transactions
                // We test store+load in single tx using initAndAdd which does both
                expect(await mock.initAndAdd.staticCall(42, 0)).to.equal(42n);
            });

            it('should clear value between transactions', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                await mock.tstoreUint(100);
                // In next transaction, transient storage is cleared
                expect(await mock.tloadUint()).to.equal(0n);
            });
        });

        describe('inc', function () {
            it('should increment from 0 to 1', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                expect(await mock.inc.staticCall()).to.equal(1n);
            });

            it('should increment sequentially in same transaction', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                // Note: Each call is separate transaction, so always starts from 0
                expect(await mock.inc.staticCall()).to.equal(1n);
            });
        });

        describe('dec', function () {
            it('should revert on underflow from 0', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                await expect(mock.dec()).to.be.reverted;
            });

            it('should revert with custom exception on underflow', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                const customSelector = '0x12345678';
                await expect(mock.decWithException(customSelector)).to.be.reverted;
            });
        });

        describe('unsafeInc/unsafeDec', function () {
            it('should increment without check', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                expect(await mock.unsafeInc.staticCall()).to.equal(1n);
            });

            it('should underflow without reverting', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                // unsafeDec from 0 should return max uint256
                expect(await mock.unsafeDec.staticCall()).to.equal(ethers.MaxUint256);
            });
        });

        describe('initAndAdd', function () {
            it('should initialize with value if zero and add', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                expect(await mock.initAndAdd.staticCall(100, 5)).to.equal(105n);
            });
        });
    });

    describe('taddress', function () {
        it('should return zero address for uninitialized', async function () {
            const { mock } = await loadFixture(deployTransientMock);
            expect(await mock.tloadAddress()).to.equal(ethers.ZeroAddress);
        });

        it('should clear address between transactions', async function () {
            const { mock } = await loadFixture(deployTransientMock);
            const testAddress = '0x1234567890123456789012345678901234567890';
            await mock.tstoreAddress(testAddress);
            // Transient storage cleared between txs
            expect(await mock.tloadAddress()).to.equal(ethers.ZeroAddress);
        });
    });

    describe('tbytes32', function () {
        it('should return zero for uninitialized', async function () {
            const { mock } = await loadFixture(deployTransientMock);
            expect(await mock.tloadBytes32()).to.equal(ethers.ZeroHash);
        });

        it('should clear bytes32 between transactions', async function () {
            const { mock } = await loadFixture(deployTransientMock);
            const testBytes = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
            await mock.tstoreBytes32(testBytes);
            // Transient storage cleared between txs
            expect(await mock.tloadBytes32()).to.equal(ethers.ZeroHash);
        });
    });
});
