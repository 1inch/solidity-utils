import { getNetworkConnection } from '../../src/network.js';
import { expect } from '../../src/expect.js';

const { ethers, networkHelpers } = await getNetworkConnection();


for (const contractName of ['TransientLockMock', 'TransientLockUnsafeMock']) {
    describe(contractName, function () {
        async function deployMock() {
            const mock = await (await ethers.getContractFactory(contractName)).deploy();
            return { mock };
        }

        describe('lock', function () {
            it('should lock successfully when unlocked', async function () {
                const { mock } = await networkHelpers.loadFixture(deployMock);
                await expect(mock.lock()).not.to.revert(ethers);
            });

            it('should be locked after lock() call within same transaction', async function () {
                const { mock } = await networkHelpers.loadFixture(deployMock);
                expect(await mock.lockAndCheck.staticCall()).to.equal(true);
            });
        });

        describe('unlock', function () {
            it('should revert when unlocking without lock', async function () {
                const { mock } = await networkHelpers.loadFixture(deployMock);
                await expect(mock.unlockWithoutLock()).to.revert(ethers);
            });
        });

        describe('isLocked', function () {
            it('should return false initially', async function () {
                const { mock } = await networkHelpers.loadFixture(deployMock);
                expect(await mock.isLocked()).to.equal(false);
            });

            it('should return false after lock and unlock in same transaction', async function () {
                const { mock } = await networkHelpers.loadFixture(deployMock);
                expect(await mock.lockUnlockAndCheck.staticCall()).to.equal(false);
            });
        });

        describe('double lock', function () {
            it('should revert on double lock', async function () {
                const { mock } = await networkHelpers.loadFixture(deployMock);
                await expect(mock.doubleLock())
                    .to.be.revertedWithCustomError(mock, 'UnexpectedLock');
            });
        });

        describe('transient behavior', function () {
            it('should reset lock state between transactions', async function () {
                const { mock } = await networkHelpers.loadFixture(deployMock);
                await mock.lock();
                expect(await mock.isLocked()).to.equal(false);
            });
        });
    });
}
