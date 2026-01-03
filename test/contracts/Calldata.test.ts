import { expect } from '../../src/expect';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('Calldata', function () {
    const testData = '0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';

    async function deployCalldataMock() {
        const CalldataMock = await ethers.getContractFactory('CalldataMock');
        const mock = await CalldataMock.deploy();
        return { mock };
    }

    describe('slice with begin and end', function () {
        it('should slice from beginning', async function () {
            const { mock } = await loadFixture(deployCalldataMock);
            const result = await mock.sliceWithBounds(testData, 0, 10);
            expect(result).to.equal('0x00010203040506070809');
        });

        it('should slice from middle', async function () {
            const { mock } = await loadFixture(deployCalldataMock);
            const result = await mock.sliceWithBounds(testData, 5, 15);
            expect(result).to.equal('0x05060708090a0b0c0d0e');
        });

        it('should slice entire data', async function () {
            const { mock } = await loadFixture(deployCalldataMock);
            const result = await mock.sliceWithBounds(testData, 0, 32);
            expect(result).to.equal(testData);
        });

        it('should return empty for equal begin and end', async function () {
            const { mock } = await loadFixture(deployCalldataMock);
            const result = await mock.sliceWithBounds(testData, 10, 10);
            expect(result).to.equal('0x');
        });
    });

    describe('slice with bounds checking', function () {
        it('should slice successfully within bounds', async function () {
            const { mock } = await loadFixture(deployCalldataMock);
            const result = await mock.sliceWithBoundsChecked(testData, 0, 10);
            expect(result).to.equal('0x00010203040506070809');
        });

        it('should revert when end exceeds length', async function () {
            const { mock } = await loadFixture(deployCalldataMock);
            await expect(mock.sliceWithBoundsChecked(testData, 0, 33))
                .to.be.revertedWithCustomError(mock, 'TestError');
        });
    });

    describe('slice to end', function () {
        it('should slice from beginning to end', async function () {
            const { mock } = await loadFixture(deployCalldataMock);
            const result = await mock.sliceToEnd(testData, 0);
            expect(result).to.equal(testData);
        });

        it('should slice from middle to end', async function () {
            const { mock } = await loadFixture(deployCalldataMock);
            const result = await mock.sliceToEnd(testData, 16);
            expect(result).to.equal('0x101112131415161718191a1b1c1d1e1f');
        });

        it('should return empty when begin equals length', async function () {
            const { mock } = await loadFixture(deployCalldataMock);
            const result = await mock.sliceToEnd(testData, 32);
            expect(result).to.equal('0x');
        });
    });

    describe('slice to end with bounds checking', function () {
        it('should slice successfully within bounds', async function () {
            const { mock } = await loadFixture(deployCalldataMock);
            const result = await mock.sliceToEndChecked(testData, 16);
            expect(result).to.equal('0x101112131415161718191a1b1c1d1e1f');
        });

        it('should revert when begin exceeds length', async function () {
            const { mock } = await loadFixture(deployCalldataMock);
            await expect(mock.sliceToEndChecked(testData, 33))
                .to.be.revertedWithCustomError(mock, 'TestError');
        });
    });
});
