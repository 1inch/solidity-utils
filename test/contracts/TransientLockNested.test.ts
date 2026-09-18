import { getNetworkConnection } from '../../src/network.js';
import { expect } from '../../src/expect.js';
import { executionGas } from '../../src/profileEVM.js';

const { ethers, networkHelpers } = await getNetworkConnection();


const MAKER = '0x1111111111111111111111111111111111111111';
const STRATEGY = ethers.id('strategy-1');

describe('TransientLock nested mapping', function () {
    async function deployNestedMocks() {
        const safe = await (await ethers.getContractFactory('TransientLockNestedMock')).deploy();
        const unsafe = await (await ethers.getContractFactory('TransientLockUnsafeNestedMock')).deploy();
        return { safe, unsafe };
    }

    describe('TransientLockLib (with offset)', function () {
        it('should lock successfully', async function () {
            const { safe } = await networkHelpers.loadFixture(deployNestedMocks);
            await expect(safe.lock(MAKER, STRATEGY)).not.to.revert(ethers);
        });

        it('should return false initially', async function () {
            const { safe } = await networkHelpers.loadFixture(deployNestedMocks);
            expect(await safe.isLocked(MAKER, STRATEGY)).to.equal(false);
        });

        it('should reset between transactions', async function () {
            const { safe } = await networkHelpers.loadFixture(deployNestedMocks);
            await safe.lock(MAKER, STRATEGY);
            expect(await safe.isLocked(MAKER, STRATEGY)).to.equal(false);
        });

        it('should isolate different maker/strategy pairs', async function () {
            const { safe } = await networkHelpers.loadFixture(deployNestedMocks);
            const otherMaker = '0x2222222222222222222222222222222222222222';
            const otherStrategy = ethers.id('strategy-2');
            await safe.lock(MAKER, STRATEGY);
            expect(await safe.isLocked(otherMaker, STRATEGY)).to.equal(false);
            expect(await safe.isLocked(MAKER, otherStrategy)).to.equal(false);
        });
    });

    describe('TransientLockUnsafeLib (without offset)', function () {
        it('should lock successfully', async function () {
            const { unsafe } = await networkHelpers.loadFixture(deployNestedMocks);
            await expect(unsafe.lock(MAKER, STRATEGY)).not.to.revert(ethers);
        });
    });

    describe('Gas comparison: TransientLockLib vs TransientLockUnsafeLib (nested mapping)', function () {
        before(function () {
            if (process.env.SOLIDITY_COVERAGE === 'true') { this.skip(); }
        });

        it('lock', async function () {
            const { safe, unsafe } = await networkHelpers.loadFixture(deployNestedMocks);
            const safeGas = await executionGas(ethers.provider, safe.lock(MAKER, STRATEGY));
            const unsafeGas = await executionGas(ethers.provider, unsafe.lock(MAKER, STRATEGY));
            console.log(`        lock — safe: ${safeGas}, unsafe: ${unsafeGas}, delta: ${safeGas - unsafeGas}`);
            expect(safeGas).to.be.gte(unsafeGas);
        });
    });
});
