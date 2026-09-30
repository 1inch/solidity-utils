import { ethers, loadFixture } from '../../src/hardhatHelpers.js';
import { expect } from '../../src/expect.js';

const MAKER = '0x1111111111111111111111111111111111111111';
const STRATEGY = ethers.id('strategy-1');
const OTHER_MAKER = '0x2222222222222222222222222222222222222222';
const OTHER_STRATEGY = ethers.id('strategy-2');

describe('TransientLockNestedMock', function () {
    async function deployMock() {
        const mock = await (await ethers.getContractFactory('TransientLockNestedMock')).deploy();
        return { mock };
    }

    it('should return false initially', async function () {
        const { mock } = await loadFixture(deployMock);
        expect(await mock.isLocked(MAKER, STRATEGY)).to.equal(false);
    });

    it('should isolate and update multiple maker/strategy pairs', async function () {
        const { mock } = await loadFixture(deployMock);
        const results = await mock.multicall.staticCall([
            mock.interface.encodeFunctionData('isLocked', [MAKER, STRATEGY]),
            mock.interface.encodeFunctionData('lock', [MAKER, STRATEGY]),
            mock.interface.encodeFunctionData('isLocked', [MAKER, STRATEGY]),
            mock.interface.encodeFunctionData('isLocked', [OTHER_MAKER, OTHER_STRATEGY]),
            mock.interface.encodeFunctionData('lock', [OTHER_MAKER, OTHER_STRATEGY]),
            mock.interface.encodeFunctionData('isLocked', [MAKER, STRATEGY]),
            mock.interface.encodeFunctionData('isLocked', [OTHER_MAKER, OTHER_STRATEGY]),
            mock.interface.encodeFunctionData('unlock', [MAKER, STRATEGY]),
            mock.interface.encodeFunctionData('isLocked', [MAKER, STRATEGY]),
            mock.interface.encodeFunctionData('isLocked', [OTHER_MAKER, OTHER_STRATEGY]),
            mock.interface.encodeFunctionData('unlock', [OTHER_MAKER, OTHER_STRATEGY]),
            mock.interface.encodeFunctionData('isLocked', [OTHER_MAKER, OTHER_STRATEGY]),
        ]);

        expect(mock.interface.decodeFunctionResult('isLocked', results[0])[0]).to.equal(false);
        expect(mock.interface.decodeFunctionResult('isLocked', results[2])[0]).to.equal(true);
        expect(mock.interface.decodeFunctionResult('isLocked', results[3])[0]).to.equal(false);
        expect(mock.interface.decodeFunctionResult('isLocked', results[5])[0]).to.equal(true);
        expect(mock.interface.decodeFunctionResult('isLocked', results[6])[0]).to.equal(true);
        expect(mock.interface.decodeFunctionResult('isLocked', results[8])[0]).to.equal(false);
        expect(mock.interface.decodeFunctionResult('isLocked', results[9])[0]).to.equal(true);
        expect(mock.interface.decodeFunctionResult('isLocked', results[11])[0]).to.equal(false);
    });

    it('should revert when locking the same pair twice', async function () {
        const { mock } = await loadFixture(deployMock);
        const lock = mock.interface.encodeFunctionData('lock', [MAKER, STRATEGY]);

        await expect(mock.multicall([lock, lock])).to.be.revertedWithCustomError(mock, 'UnexpectedLock');
    });

    it('should revert when unlocking a different pair', async function () {
        const { mock } = await loadFixture(deployMock);
        const calls = [
            mock.interface.encodeFunctionData('lock', [MAKER, STRATEGY]),
            mock.interface.encodeFunctionData('unlock', [OTHER_MAKER, OTHER_STRATEGY]),
        ];

        await expect(mock.multicall(calls)).to.revert(ethers);
    });

    it('should reset all lock states between transactions', async function () {
        const { mock } = await loadFixture(deployMock);
        await mock.multicall([
            mock.interface.encodeFunctionData('lock', [MAKER, STRATEGY]),
            mock.interface.encodeFunctionData('lock', [OTHER_MAKER, OTHER_STRATEGY]),
        ]);

        expect(await mock.isLocked(MAKER, STRATEGY)).to.equal(false);
        expect(await mock.isLocked(OTHER_MAKER, OTHER_STRATEGY)).to.equal(false);
    });
});
