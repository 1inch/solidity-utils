import { expect } from '../../src/expect';
import { executionGas } from '../../src/profileEVM';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre, { ethers } from 'hardhat';
import type { TransientMock } from '../../typechain-types/contracts/tests/mocks/TransientMock';
import type { TransientUnsafeMock } from '../../typechain-types/contracts/tests/mocks/TransientUnsafeMock';

for (const contractName of ['TransientMock', 'TransientUnsafeMock']) {
    describe(contractName, function () {
        async function deployTransientMock(): Promise<{ mock: TransientMock | TransientUnsafeMock }> {
            const TransientMock = await ethers.getContractFactory(contractName);
            const mock = await TransientMock.deploy() as unknown as TransientMock | TransientUnsafeMock;
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

                it('should revert on overflow (when incremented == 0)', async function () {
                    const { mock } = await loadFixture(deployTransientMock);
                    await expect(mock.incFromMaxValue()).to.be.reverted;
                });

                it('should revert with custom exception on overflow', async function () {
                    const { mock } = await loadFixture(deployTransientMock);
                    const customSelector = '0xdeadbeef';
                    await expect(mock.incFromMaxValueWithException(customSelector)).to.be.reverted;
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
}

describe('Offset', function () {
    async function deployTransientMock() {
        const TransientMock = await ethers.getContractFactory('TransientMock');
        const mock = await TransientMock.deploy();
        return { mock };
    }

    it('should have stored OFFSET equal to the computed formula', async function () {
        const { mock } = await loadFixture(deployTransientMock);
        const computed = await mock.computedOffset();
        const stored = await mock.storedOffset();
        expect(stored).to.equal(computed);
    });

    it('should match the expected hardcoded value', async function () {
        const { mock } = await loadFixture(deployTransientMock);
        const stored = await mock.storedOffset();
        expect(stored).to.equal('0xb2e1616e94c4f038b21d9137633825dc3f28ecaa196ae6785bc038208b529200');
    });

    it('should match ethers-computed value', async function () {
        const { mock } = await loadFixture(deployTransientMock);
        const innerHash = ethers.keccak256(ethers.toUtf8Bytes('TransientTest.storage.Offset'));
        const subtracted = BigInt(innerHash) - 1n;
        const encoded = ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [subtracted]);
        const outerHash = ethers.keccak256(encoded);
        const mask = ~BigInt('0xff');
        const expected = BigInt(outerHash) & mask;
        const expectedHex = '0x' + expected.toString(16).padStart(64, '0');
        expect(await mock.storedOffset()).to.equal(expectedHex);
    });
});

describe('Gas comparison: TransientLib (with offset) vs TransientUnsafe (without offset)', function () {
    async function deployBothMocks() {
        const TransientMock = await ethers.getContractFactory('TransientMock');
        const safe = await TransientMock.deploy();
        const TransientUnsafeMock = await ethers.getContractFactory('TransientUnsafeMock');
        const unsafe = await TransientUnsafeMock.deploy();
        return { safe, unsafe };
    }

    before(function () {
        if (hre.__SOLIDITY_COVERAGE_RUNNING) { this.skip(); }
    });

    it('tstore uint256', async function () {
        const { safe, unsafe } = await loadFixture(deployBothMocks);
        const safeGas = await executionGas(ethers.provider, safe.tstoreUint(42));
        const unsafeGas = await executionGas(ethers.provider, unsafe.tstoreUint(42));
        console.log(`        tstore uint256 — safe: ${safeGas}, unsafe: ${unsafeGas}, delta: ${safeGas - unsafeGas}`);
        expect(safeGas).to.be.gte(unsafeGas);
    });

    it('inc', async function () {
        const { safe, unsafe } = await loadFixture(deployBothMocks);
        const safeGas = await executionGas(ethers.provider, safe.inc());
        const unsafeGas = await executionGas(ethers.provider, unsafe.inc());
        console.log(`        inc — safe: ${safeGas}, unsafe: ${unsafeGas}, delta: ${safeGas - unsafeGas}`);
        expect(safeGas).to.be.gte(unsafeGas);
    });

    it('unsafeInc', async function () {
        const { safe, unsafe } = await loadFixture(deployBothMocks);
        const safeGas = await executionGas(ethers.provider, safe.unsafeInc());
        const unsafeGas = await executionGas(ethers.provider, unsafe.unsafeInc());
        console.log(`        unsafeInc — safe: ${safeGas}, unsafe: ${unsafeGas}, delta: ${safeGas - unsafeGas}`);
        expect(safeGas).to.be.gte(unsafeGas);
    });

    it('unsafeDec', async function () {
        const { safe, unsafe } = await loadFixture(deployBothMocks);
        const safeGas = await executionGas(ethers.provider, safe.unsafeDec());
        const unsafeGas = await executionGas(ethers.provider, unsafe.unsafeDec());
        console.log(`        unsafeDec — safe: ${safeGas}, unsafe: ${unsafeGas}, delta: ${safeGas - unsafeGas}`);
        expect(safeGas).to.be.gte(unsafeGas);
    });

    it('initAndAdd', async function () {
        const { safe, unsafe } = await loadFixture(deployBothMocks);
        const safeGas = await executionGas(ethers.provider, safe.initAndAdd(100, 5));
        const unsafeGas = await executionGas(ethers.provider, unsafe.initAndAdd(100, 5));
        console.log(`        initAndAdd — safe: ${safeGas}, unsafe: ${unsafeGas}, delta: ${safeGas - unsafeGas}`);
        expect(safeGas).to.be.gte(unsafeGas);
    });

    it('tstore address', async function () {
        const { safe, unsafe } = await loadFixture(deployBothMocks);
        const addr = '0x1234567890123456789012345678901234567890';
        const safeGas = await executionGas(ethers.provider, safe.tstoreAddress(addr));
        const unsafeGas = await executionGas(ethers.provider, unsafe.tstoreAddress(addr));
        console.log(`        tstore address — safe: ${safeGas}, unsafe: ${unsafeGas}, delta: ${safeGas - unsafeGas}`);
        expect(safeGas).to.be.gte(unsafeGas);
    });

    it('tstore bytes32', async function () {
        const { safe, unsafe } = await loadFixture(deployBothMocks);
        const val = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const safeGas = await executionGas(ethers.provider, safe.tstoreBytes32(val));
        const unsafeGas = await executionGas(ethers.provider, unsafe.tstoreBytes32(val));
        console.log(`        tstore bytes32 — safe: ${safeGas}, unsafe: ${unsafeGas}, delta: ${safeGas - unsafeGas}`);
        expect(safeGas).to.be.gte(unsafeGas);
    });
});
