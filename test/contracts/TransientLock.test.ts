import { expect } from '../../src/expect';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('TransientLock', function () {
    async function deployTransientLockMock() {
        const TransientLockMock = await ethers.getContractFactory('TransientLockMock');
        const mock = await TransientLockMock.deploy();
        return { mock };
    }

    describe('lock', function () {
        it('should lock successfully when unlocked', async function () {
            const { mock } = await loadFixture(deployTransientLockMock);
            await expect(mock.lock()).not.to.be.reverted;
        });

        it('should be locked after lock() call within same transaction', async function () {
            const { mock } = await loadFixture(deployTransientLockMock);
            expect(await mock.lockAndCheck.staticCall()).to.equal(true);
        });
    });

    describe('unlock', function () {
        it('should revert when unlocking without lock', async function () {
            const { mock } = await loadFixture(deployTransientLockMock);
            await expect(mock.unlockWithoutLock()).to.be.reverted;
        });
    });

    describe('isLocked', function () {
        it('should return false initially', async function () {
            const { mock } = await loadFixture(deployTransientLockMock);
            expect(await mock.isLocked()).to.equal(false);
        });

        it('should return false after lock and unlock in same transaction', async function () {
            const { mock } = await loadFixture(deployTransientLockMock);
            expect(await mock.lockUnlockAndCheck.staticCall()).to.equal(false);
        });
    });

    describe('double lock', function () {
        it('should revert on double lock', async function () {
            const { mock } = await loadFixture(deployTransientLockMock);
            await expect(mock.doubleLock())
                .to.be.revertedWithCustomError(mock, 'UnexpectedLock');
        });
    });

    describe('transient behavior', function () {
        it('should reset lock state between transactions', async function () {
            const { mock } = await loadFixture(deployTransientLockMock);
            await mock.lock();
            // In next transaction, lock should be released
            expect(await mock.isLocked()).to.equal(false);
        });
    });
});
