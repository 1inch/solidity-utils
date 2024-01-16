import { expect } from '../../src/expect';
import { trim0x } from '../../src/permit';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { BytesStorageMock } from '../../typechain-types';

type Slice = {
    slot: bigint,
    offset: bigint,
    length: bigint,
};

describe('BytesStorageMock', function () {
    const shortBytes = '0x000102030405060708090a';
    const longBytes = '0x101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f50';

    async function deployBytesStorageMockWithShortData() {
        const BytesStorageMock = await ethers.getContractFactory('BytesStorageMock');
        const bytesStorageMock = <BytesStorageMock><unknown> await BytesStorageMock.deploy();
        await bytesStorageMock.setData(shortBytes);
        return { bytesStorageMock, data: null };
    }

    async function deployBytesStorageMockWithLongData() {
        const BytesStorageMock = await ethers.getContractFactory('BytesStorageMock');
        const bytesStorageMock = <BytesStorageMock><unknown> await BytesStorageMock.deploy();
        await bytesStorageMock.setData(longBytes);
        return { bytesStorageMock, data: null };
    }

    async function deployBytesStorageMockWithShortDataAndWrap() {
        const { bytesStorageMock } = await deployBytesStorageMockWithShortData();
        const [slot, offset, length]: Array<bigint> = await bytesStorageMock.wrap();
        return { bytesStorageMock, data: { slot, offset, length } };
    }

    async function deployBytesStorageMockWithLongDataAndWrap() {
        const { bytesStorageMock } = await deployBytesStorageMockWithLongData();
        const [slot, offset, length]: Array<bigint> = await bytesStorageMock.wrap();
        return { bytesStorageMock, data: { slot, offset, length } };
    }

    shouldWork(
        {
            'shortData': deployBytesStorageMockWithShortData,
            'longData': deployBytesStorageMockWithLongData,
            'shortDataAndWrap': deployBytesStorageMockWithShortDataAndWrap,
            'longDataAndWrap': deployBytesStorageMockWithLongDataAndWrap,
        },
    );

    function shouldWork(fixtures: { [dataType: string]: () => Promise<{ bytesStorageMock: BytesStorageMock, data: Slice | null }> }) {
        describe('wrap', function () {
            it('should return correct wrapped data with short data', async function () {
                const { bytesStorageMock } = await loadFixture(fixtures.shortData);
                const [slot, offset, length]: Array<bigint> = await bytesStorageMock.wrap();
                expect(slot).to.be.equal(0n);
                expect(offset).to.be.equal(0n);
                expect(length).to.be.equal(trim0x(shortBytes).length / 2);
            });

            it('should return correct wrapped data with long data', async function () {
                const { bytesStorageMock } = await loadFixture(fixtures.longData);
                const [slot, offset, length]: Array<bigint> = await bytesStorageMock.wrap();
                expect(slot).to.be.gt(0n);
                expect(offset).to.be.equal(0n);
                expect(length).to.be.equal(trim0x(longBytes).length / 2);
            });
        });

        describe('slice', function () {
            describe('short data', function () {
                it('should revert with incorrect offset', async function () {
                    const { bytesStorageMock, data } = await loadFixture(fixtures.shortDataAndWrap);
                    await expect(bytesStorageMock.wrapAndSlice(data!.offset + data!.length + 1n, 0)).to.be.revertedWithCustomError(bytesStorageMock, 'OutOfBounds');
                });

                it('should revert with incorrect size', async function () {
                    const { bytesStorageMock, data } = await loadFixture(fixtures.shortDataAndWrap);
                    await expect(bytesStorageMock.wrapAndSlice(data!.offset, data!.length + 1n)).to.be.revertedWithCustomError(bytesStorageMock, 'OutOfBounds');
                });

                it('should revert with incorrect offset + size', async function () {
                    const { bytesStorageMock, data } = await loadFixture(fixtures.shortDataAndWrap);
                    await expect(bytesStorageMock.wrapAndSlice(data!.offset + data!.length / 2n, data!.length / 2n + 10n)).to.be.revertedWithCustomError(bytesStorageMock, 'OutOfBounds');
                });

                it('should slice data', async function () {
                    const { bytesStorageMock, data } = await loadFixture(fixtures.shortDataAndWrap);
                    expect(await bytesStorageMock.wrapAndSlice(data!.offset + 2n, 4n)).to.be.deep.eq([data!.slot, data!.offset + 2n, 4n]);
                });
            });

            describe('long data', function () {
                it('should revert with incorrect offset with long data', async function () {
                    const { bytesStorageMock, data } = await loadFixture(fixtures.longDataAndWrap);
                    await expect(bytesStorageMock.wrapAndSlice(data!.offset + data!.length + 1n, 0)).to.be.revertedWithCustomError(bytesStorageMock, 'OutOfBounds');
                });

                it('should revert with incorrect size with long data', async function () {
                    const { bytesStorageMock, data } = await loadFixture(fixtures.longDataAndWrap);
                    await expect(bytesStorageMock.wrapAndSlice(data!.offset, data!.length + 1n)).to.be.revertedWithCustomError(bytesStorageMock, 'OutOfBounds');
                });

                it('should revert with incorrect offset + size with long data', async function () {
                    const { bytesStorageMock, data } = await loadFixture(fixtures.longDataAndWrap);
                    await expect(bytesStorageMock.wrapAndSlice(data!.offset + data!.length / 2n, data!.length / 2n + 10n)).to.be.revertedWithCustomError(bytesStorageMock, 'OutOfBounds');
                });

                it('should slice data', async function () {
                    const { bytesStorageMock, data } = await loadFixture(fixtures.longDataAndWrap);
                    expect(await bytesStorageMock.wrapAndSlice(data!.offset + 20n, 10n)).to.be.deep.eq([data!.slot, data!.offset + 20n, 10n]);
                });
            });
        });

        describe('copy', function () {
            describe('short data', function () {
                it('should return the same bytes after copy', async function () {
                    const { bytesStorageMock } = await loadFixture(fixtures.shortData);
                    expect(await bytesStorageMock.wrapAndCopy()).to.be.equal(shortBytes);
                });

                it('should return correct bytes after slice and copy', async function () {
                    const { bytesStorageMock, data } = await loadFixture(fixtures.shortDataAndWrap);
                    expect(await bytesStorageMock.wrapWithSliceAndCopy(data!.offset + 2n, 4n)).to.be.equal('0x' + trim0x(shortBytes).substring(2*2, 2*2 + 4*2));
                });
            });

            describe('long data', function () {
                it('should return the same bytes after copy', async function () {
                    const { bytesStorageMock } = await loadFixture(fixtures.longData);
                    expect(await bytesStorageMock.wrapAndCopy()).to.be.equal(longBytes);
                });

                it('should return correct bytes after slice and copy', async function () {
                    const { bytesStorageMock, data } = await loadFixture(fixtures.longDataAndWrap);
                    expect(await bytesStorageMock.wrapWithSliceAndCopy(data!.offset + 20n, 10n)).to.be.equal('0x' + trim0x(longBytes).substring(20*2, 20*2 + 10*2));
                });

                it('should return correct bytes after slice and copy more than 50 bytes', async function () {
                    const { bytesStorageMock, data } = await loadFixture(fixtures.longDataAndWrap);
                    expect(await bytesStorageMock.wrapWithSliceAndCopy(data!.offset + 2n, 56n)).to.be.equal('0x' + trim0x(longBytes).substring(2*2, 2*2 + 56*2));
                });
            });
        });
    }
});
