import { expect } from '../../src/expect';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

const MAKER = '0x1111111111111111111111111111111111111111';
const STRATEGY = ethers.id('strategy-1');

describe('TransientLock nested mapping', function () {
    async function deployNestedMock() {
        const mock = await (await ethers.getContractFactory('TransientLockNestedMock')).deploy();
        return { mock };
    }

    describe('TransientLockLib (with offset)', function () {
        it('should lock successfully', async function () {
            const { mock } = await loadFixture(deployNestedMock);
            await expect(mock.lock(MAKER, STRATEGY)).not.to.be.reverted;
        });

        it('should return false initially', async function () {
            const { mock } = await loadFixture(deployNestedMock);
            expect(await mock.isLocked(MAKER, STRATEGY)).to.equal(false);
        });

        it('should reset between transactions', async function () {
            const { mock } = await loadFixture(deployNestedMock);
            await mock.lock(MAKER, STRATEGY);
            expect(await mock.isLocked(MAKER, STRATEGY)).to.equal(false);
        });

        it('should isolate different maker/strategy pairs', async function () {
            const { mock } = await loadFixture(deployNestedMock);
            const otherMaker = '0x2222222222222222222222222222222222222222';
            const otherStrategy = ethers.id('strategy-2');
            await mock.lock(MAKER, STRATEGY);
            expect(await mock.isLocked(otherMaker, STRATEGY)).to.equal(false);
            expect(await mock.isLocked(MAKER, otherStrategy)).to.equal(false);
        });
    });
});
