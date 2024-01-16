import { expect } from '../../src/expect';
import { trim0x } from '../../src/permit';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre, { ethers } from 'hardhat';
import chai from 'chai';
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot';
chai.use(jestSnapshotPlugin());

describe('BytesMemoryMock', function () {
    const bytes = '0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';

    async function deployBytesMemoryMockWithData() {
        const BytesMemoryMock = await ethers.getContractFactory('BytesMemoryMock');
        const bytesMemoryMock = await BytesMemoryMock.deploy();
        const [pointer, length]: Array<bigint> = await bytesMemoryMock.wrap(bytes);
        return { bytesMemoryMock, data: { pointer, length } };
    }

    describe('wrap', function () {
        it('should return correct pointer and length of data', async function () {
            const { bytesMemoryMock } = await loadFixture(deployBytesMemoryMockWithData);
            const [pointer, length]: Array<bigint> = await bytesMemoryMock.wrap(bytes);
            expect(pointer).to.be.equal(160n);
            expect(length).to.be.equal(trim0x(bytes).length / 2);
        });

        it('should return correct pointer and length of empty data', async function () {
            const { bytesMemoryMock } = await loadFixture(deployBytesMemoryMockWithData);
            const [pointer, length]: Array<bigint> = await bytesMemoryMock.wrap('0x');
            expect(pointer).to.be.equal(160n);
            expect(length).to.be.equal(0);
        });

        it('should return correct pointer and length of data with non-default pointer', async function () {
            const { bytesMemoryMock } = await loadFixture(deployBytesMemoryMockWithData);
            const [pointer, length]: Array<bigint> = await bytesMemoryMock.wrapWithNonDefaultPointer(bytes, 1);
            expect(pointer).to.be.equal(288);
            expect(length).to.be.equal(trim0x(bytes).length / 2);
        });
    });

    describe('slice', function () {
        it('should revert with incorrect offset', async function () {
            const { bytesMemoryMock, data } = await loadFixture(deployBytesMemoryMockWithData);
            await expect(bytesMemoryMock.slice(data, data.pointer + 1n, 0)).to.be.revertedWithCustomError(bytesMemoryMock, 'OutOfBounds');
        });

        it('should revert with incorrect size', async function () {
            const { bytesMemoryMock, data } = await loadFixture(deployBytesMemoryMockWithData);
            await expect(bytesMemoryMock.slice(data, data.pointer, data.length + 1n)).to.be.revertedWithCustomError(bytesMemoryMock, 'OutOfBounds');
        });

        it('should revert with incorrect offset + size', async function () {
            const { bytesMemoryMock, data } = await loadFixture(deployBytesMemoryMockWithData);
            await expect(bytesMemoryMock.slice(data, data.pointer + data.length/2n, data.length/2n + 1n)).to.be.revertedWithCustomError(bytesMemoryMock, 'OutOfBounds');
        });

        it('should slice data', async function () {
            const { bytesMemoryMock, data } = await loadFixture(deployBytesMemoryMockWithData);
            expect(await bytesMemoryMock.slice(data, 10n, 20n)).to.be.deep.eq([data.pointer + 10n, 20n]);
        });
    });

    describe('unwrap', function () {
        it('should return correct bytes after wrap', async function () {
            const { bytesMemoryMock } = await loadFixture(deployBytesMemoryMockWithData);
            expect(await bytesMemoryMock.wrapAndUnwrap(bytes)).to.be.equal(bytes);
        });

        it('should return correct bytes after wrap with non-default pointer', async function () {
            const { bytesMemoryMock } = await loadFixture(deployBytesMemoryMockWithData);
            expect(await bytesMemoryMock.wrapWithNonDefaultPointerAndUnwrap(bytes, 10n)).to.be.equal(bytes);
        });

        it('should return correct bytes slice', async function () {
            const { bytesMemoryMock } = await loadFixture(deployBytesMemoryMockWithData);
            expect(await bytesMemoryMock.wrapWithSliceAndUnwrap(bytes, 16n, 10n)).to.be.equal('0x' + trim0x(bytes).substring(32, 32 + 20));
        });
    });

    describe('Gas usage', function () {
        before(function () {
            if (hre.__SOLIDITY_COVERAGE_RUNNING) { this.skip(); }
        });

        it('unwrap 32 bytes', async function () {
            const { bytesMemoryMock } = await loadFixture(deployBytesMemoryMockWithData);
            const tx = await (await bytesMemoryMock.wrapAndUnwrap.send(bytes)).wait();
            expect(tx!.gasUsed).toMatchSnapshot();
        });

        it('unwrap 33 bytes', async function () {
            const { bytesMemoryMock } = await loadFixture(deployBytesMemoryMockWithData);
            const tx = await (await bytesMemoryMock.wrapAndUnwrap.send(bytes + 'ff')).wait();
            expect(tx!.gasUsed).toMatchSnapshot();
        });

        it('unwrap 64 bytes', async function () {
            const { bytesMemoryMock } = await loadFixture(deployBytesMemoryMockWithData);
            const tx = await (await bytesMemoryMock.wrapAndUnwrap.send(bytes + trim0x(bytes))).wait();
            expect(tx!.gasUsed).toMatchSnapshot();
        });

        it('slice', async function () {
            const { bytesMemoryMock, data } = await loadFixture(deployBytesMemoryMockWithData);
            const tx = await (await bytesMemoryMock.slice.send(data, 10n, 20n)).wait();
            expect(tx!.gasUsed).toMatchSnapshot();
        });
    });
});
