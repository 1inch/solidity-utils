import { ethers, loadFixture } from '../../src/hardhatHelpers.js';
import { expect } from '../../src/expect.js';

describe('TransientLockMock', function () {
    async function deployMock() {
        const mock = await (await ethers.getContractFactory('TransientLockMock')).deploy();
        return { mock };
    }

    it('should support locking, unlocking, and relocking', async function () {
        const { mock } = await loadFixture(deployMock);
        const results = await mock.multicall.staticCall([
            mock.interface.encodeFunctionData('lock'),
            mock.interface.encodeFunctionData('isLocked'),
            mock.interface.encodeFunctionData('unlock'),
            mock.interface.encodeFunctionData('isLocked'),
            mock.interface.encodeFunctionData('lock'),
            mock.interface.encodeFunctionData('isLocked'),
            mock.interface.encodeFunctionData('unlock'),
            mock.interface.encodeFunctionData('isLocked'),
            mock.interface.encodeFunctionData('lock'),
            mock.interface.encodeFunctionData('isLocked'),
            mock.interface.encodeFunctionData('unlock'),
            mock.interface.encodeFunctionData('isLocked'),
        ]);

        expect(mock.interface.decodeFunctionResult('isLocked', results[1])[0]).to.equal(true);
        expect(mock.interface.decodeFunctionResult('isLocked', results[3])[0]).to.equal(false);
        expect(mock.interface.decodeFunctionResult('isLocked', results[5])[0]).to.equal(true);
        expect(mock.interface.decodeFunctionResult('isLocked', results[7])[0]).to.equal(false);
        expect(mock.interface.decodeFunctionResult('isLocked', results[9])[0]).to.equal(true);
        expect(mock.interface.decodeFunctionResult('isLocked', results[11])[0]).to.equal(false);
    });

    it('should revert when unlocking without lock', async function () {
        const { mock } = await loadFixture(deployMock);
        await expect(mock.unlock()).to.revert(ethers);
    });

    it('should revert on double lock', async function () {
        const { mock } = await loadFixture(deployMock);
        const lock = mock.interface.encodeFunctionData('lock');

        await expect(mock.multicall([lock, lock])).to.be.revertedWithCustomError(mock, 'UnexpectedLock');
    });

    it('should reset lock state between transactions', async function () {
        const { mock } = await loadFixture(deployMock);
        await mock.lock();
        expect(await mock.isLocked()).to.equal(false);
    });
});
