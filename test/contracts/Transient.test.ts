import { ethers, loadFixture } from '../../src/hardhatHelpers.js';
import { expect } from '../../src/expect.js';

describe('TransientMock', function () {
    async function deployTransientMock() {
        const mock = await (await ethers.getContractFactory('TransientMock')).deploy();
        return { mock };
    }

    describe('tuint256', function () {
        describe('tload/tstore', function () {
            it('should return 0 for uninitialized value', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                expect(await mock.tloadUint()).to.equal(0n);
            });

            it('should store and load sequential updates', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                const results = await mock.multicall.staticCall([
                    mock.interface.encodeFunctionData('tloadUint'),
                    mock.interface.encodeFunctionData('tstoreUint', [41n]),
                    mock.interface.encodeFunctionData('tloadUint'),
                    mock.interface.encodeFunctionData('tstoreUint', [42n]),
                    mock.interface.encodeFunctionData('tloadUint'),
                ]);

                expect(mock.interface.decodeFunctionResult('tloadUint', results[0])[0]).to.equal(0n);
                expect(mock.interface.decodeFunctionResult('tloadUint', results[2])[0]).to.equal(41n);
                expect(mock.interface.decodeFunctionResult('tloadUint', results[4])[0]).to.equal(42n);
            });
        });

        describe('inc', function () {
            it('should increment sequentially', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                const results = await mock.multicall.staticCall([
                    mock.interface.encodeFunctionData('inc'),
                    mock.interface.encodeFunctionData('inc'),
                    mock.interface.encodeFunctionData('incWithException', ['0xdeadbeef']),
                    mock.interface.encodeFunctionData('tloadUint'),
                ]);

                expect(mock.interface.decodeFunctionResult('inc', results[0])[0]).to.equal(1n);
                expect(mock.interface.decodeFunctionResult('inc', results[1])[0]).to.equal(2n);
                expect(mock.interface.decodeFunctionResult('incWithException', results[2])[0]).to.equal(3n);
                expect(mock.interface.decodeFunctionResult('tloadUint', results[3])[0]).to.equal(3n);
            });

            it('should revert on overflow', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                await expect(
                    mock.multicall([
                        mock.interface.encodeFunctionData('tstoreUint', [ethers.MaxUint256]),
                        mock.interface.encodeFunctionData('inc'),
                    ]),
                ).to.be.revertedWithCustomError(mock, 'MathOverflow');
            });

            it('should use the supplied exception on overflow', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                const exception = mock.interface.getError('CustomError').selector;
                await expect(
                    mock.multicall([
                        mock.interface.encodeFunctionData('tstoreUint', [ethers.MaxUint256]),
                        mock.interface.encodeFunctionData('incWithException', [exception]),
                    ]),
                ).to.be.revertedWithCustomError(mock, 'CustomError');
            });
        });

        describe('dec', function () {
            it('should decrement sequentially', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                const results = await mock.multicall.staticCall([
                    mock.interface.encodeFunctionData('tstoreUint', [2n]),
                    mock.interface.encodeFunctionData('dec'),
                    mock.interface.encodeFunctionData('decWithException', ['0xdeadbeef']),
                    mock.interface.encodeFunctionData('tloadUint'),
                ]);

                expect(mock.interface.decodeFunctionResult('dec', results[1])[0]).to.equal(1n);
                expect(mock.interface.decodeFunctionResult('decWithException', results[2])[0]).to.equal(0n);
                expect(mock.interface.decodeFunctionResult('tloadUint', results[3])[0]).to.equal(0n);
            });

            it('should revert on underflow from 0', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                await expect(mock.multicall([mock.interface.encodeFunctionData('dec')]))
                    .to.be.revertedWithCustomError(mock, 'MathUnderflow');
            });

            it('should use the supplied exception on underflow', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                const exception = mock.interface.getError('CustomError').selector;
                await expect(
                    mock.multicall([mock.interface.encodeFunctionData('decWithException', [exception])]),
                ).to.be.revertedWithCustomError(mock, 'CustomError');
            });
        });

        describe('unsafeInc/unsafeDec', function () {
            it('should wrap on overflow', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                const results = await mock.multicall.staticCall([
                    mock.interface.encodeFunctionData('tstoreUint', [ethers.MaxUint256]),
                    mock.interface.encodeFunctionData('unsafeInc'),
                    mock.interface.encodeFunctionData('tloadUint'),
                ]);

                expect(mock.interface.decodeFunctionResult('unsafeInc', results[1])[0]).to.equal(0n);
                expect(mock.interface.decodeFunctionResult('tloadUint', results[2])[0]).to.equal(0n);
            });

            it('should wrap on underflow', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                const results = await mock.multicall.staticCall([
                    mock.interface.encodeFunctionData('unsafeDec'),
                    mock.interface.encodeFunctionData('tloadUint'),
                ]);

                expect(mock.interface.decodeFunctionResult('unsafeDec', results[0])[0]).to.equal(ethers.MaxUint256);
                expect(mock.interface.decodeFunctionResult('tloadUint', results[1])[0]).to.equal(ethers.MaxUint256);
            });
        });

        describe('initAndAdd', function () {
            it('should initialize once and then add to the current value', async function () {
                const { mock } = await loadFixture(deployTransientMock);
                const results = await mock.multicall.staticCall([
                    mock.interface.encodeFunctionData('initAndAdd', [100n, 5n]),
                    mock.interface.encodeFunctionData('initAndAdd', [999n, 5n]),
                    mock.interface.encodeFunctionData('tloadUint'),
                ]);

                expect(mock.interface.decodeFunctionResult('initAndAdd', results[0])[0]).to.equal(105n);
                expect(mock.interface.decodeFunctionResult('initAndAdd', results[1])[0]).to.equal(110n);
                expect(mock.interface.decodeFunctionResult('tloadUint', results[2])[0]).to.equal(110n);
            });
        });
    });

    describe('taddress', function () {
        it('should store and load sequential updates', async function () {
            const { mock } = await loadFixture(deployTransientMock);
            const first = '0x1234567890123456789012345678901234567890';
            const second = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
            const results = await mock.multicall.staticCall([
                mock.interface.encodeFunctionData('tloadAddress'),
                mock.interface.encodeFunctionData('tstoreAddress', [first]),
                mock.interface.encodeFunctionData('tloadAddress'),
                mock.interface.encodeFunctionData('tstoreAddress', [second]),
                mock.interface.encodeFunctionData('tloadAddress'),
            ]);

            expect(mock.interface.decodeFunctionResult('tloadAddress', results[0])[0]).to.equal(ethers.ZeroAddress);
            expect(mock.interface.decodeFunctionResult('tloadAddress', results[2])[0]).to.equal(first);
            expect(mock.interface.decodeFunctionResult('tloadAddress', results[4])[0]).to.equal(
                ethers.getAddress(second),
            );
        });
    });

    describe('tbytes32', function () {
        it('should store and load sequential updates', async function () {
            const { mock } = await loadFixture(deployTransientMock);
            const first = ethers.id('first');
            const second = ethers.id('second');
            const results = await mock.multicall.staticCall([
                mock.interface.encodeFunctionData('tloadBytes32'),
                mock.interface.encodeFunctionData('tstoreBytes32', [first]),
                mock.interface.encodeFunctionData('tloadBytes32'),
                mock.interface.encodeFunctionData('tstoreBytes32', [second]),
                mock.interface.encodeFunctionData('tloadBytes32'),
            ]);

            expect(mock.interface.decodeFunctionResult('tloadBytes32', results[0])[0]).to.equal(ethers.ZeroHash);
            expect(mock.interface.decodeFunctionResult('tloadBytes32', results[2])[0]).to.equal(first);
            expect(mock.interface.decodeFunctionResult('tloadBytes32', results[4])[0]).to.equal(second);
        });
    });

    it('should store supported values at their offset slots', async function () {
        const { mock } = await loadFixture(deployTransientMock);
        const offset = BigInt(ethers.keccak256(ethers.toBeHex(BigInt(ethers.id('1inch.transient.TransientLib')) - 1n, 32))) & ~0xffn;

        const uintValue = 42n;
        const addressValue = '0x1234567890123456789012345678901234567890';
        const bytes32Value = ethers.id('value');
        const results = await mock.multicall.staticCall([
            mock.interface.encodeFunctionData('tstoreUint', [uintValue]),
            mock.interface.encodeFunctionData('tstoreAddress', [addressValue]),
            mock.interface.encodeFunctionData('tstoreBytes32', [bytes32Value]),
            mock.interface.encodeFunctionData('tloadUint'),
            mock.interface.encodeFunctionData('getAtSlot', [ethers.toBeHex(offset + 1n, 32)]),
            mock.interface.encodeFunctionData('tloadAddress'),
            mock.interface.encodeFunctionData('getAtSlot', [ethers.toBeHex(offset + 2n, 32)]),
            mock.interface.encodeFunctionData('tloadBytes32'),
            mock.interface.encodeFunctionData('getAtSlot', [ethers.toBeHex(offset + 3n, 32)]),
        ]);

        expect(mock.interface.decodeFunctionResult('tloadUint', results[3])[0]).to.equal(uintValue);
        expect(mock.interface.decodeFunctionResult('getAtSlot', results[4])[0]).to.equal(ethers.toBeHex(uintValue, 32));
        expect(mock.interface.decodeFunctionResult('tloadAddress', results[5])[0]).to.equal(addressValue);
        expect(mock.interface.decodeFunctionResult('getAtSlot', results[6])[0]).to.equal(ethers.zeroPadValue(addressValue, 32));
        expect(mock.interface.decodeFunctionResult('tloadBytes32', results[7])[0]).to.equal(bytes32Value);
        expect(mock.interface.decodeFunctionResult('getAtSlot', results[8])[0]).to.equal(bytes32Value);
    });

    it('should isolate supported values from native transient variables', async function () {
        const { mock } = await loadFixture(deployTransientMock);
        const addressValue = '0x1234567890123456789012345678901234567890';
        const bytes32Value = ethers.id('value');
        const results = await mock.multicall.staticCall([
            mock.interface.encodeFunctionData('tstoreUint', [42n]),
            mock.interface.encodeFunctionData('tstoreAddress', [addressValue]),
            mock.interface.encodeFunctionData('tstoreBytes32', [bytes32Value]),
            mock.interface.encodeFunctionData('tloadUint'),
            mock.interface.encodeFunctionData('tloadAddress'),
            mock.interface.encodeFunctionData('tloadBytes32'),
            mock.interface.encodeFunctionData('nativeTransient0'),
            mock.interface.encodeFunctionData('nativeTransient1'),
            mock.interface.encodeFunctionData('nativeTransient2'),
            mock.interface.encodeFunctionData('nativeTransient3'),
            mock.interface.encodeFunctionData('nativeTransient4'),
        ]);

        expect(mock.interface.decodeFunctionResult('tloadUint', results[3])[0]).to.equal(42n);
        expect(mock.interface.decodeFunctionResult('tloadAddress', results[4])[0]).to.equal(addressValue);
        expect(mock.interface.decodeFunctionResult('tloadBytes32', results[5])[0]).to.equal(bytes32Value);
        expect(mock.interface.decodeFunctionResult('nativeTransient0', results[6])[0]).to.equal(ethers.ZeroHash);
        expect(mock.interface.decodeFunctionResult('nativeTransient1', results[7])[0]).to.equal(ethers.ZeroHash);
        expect(mock.interface.decodeFunctionResult('nativeTransient2', results[8])[0]).to.equal(ethers.ZeroHash);
        expect(mock.interface.decodeFunctionResult('nativeTransient3', results[9])[0]).to.equal(ethers.ZeroHash);
        expect(mock.interface.decodeFunctionResult('nativeTransient4', results[10])[0]).to.equal(ethers.ZeroHash);
    });

    it('should clear all values between transactions', async function () {
        const { mock } = await loadFixture(deployTransientMock);
        await mock.multicall([
            mock.interface.encodeFunctionData('tstoreUint', [42n]),
            mock.interface.encodeFunctionData('tstoreAddress', ['0x1234567890123456789012345678901234567890']),
            mock.interface.encodeFunctionData('tstoreBytes32', [ethers.id('value')]),
        ]);

        expect(await mock.tloadUint()).to.equal(0n);
        expect(await mock.tloadAddress()).to.equal(ethers.ZeroAddress);
        expect(await mock.tloadBytes32()).to.equal(ethers.ZeroHash);
    });
});
