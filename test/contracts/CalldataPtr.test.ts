import { expect } from '../../src/expect';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('CalldataPtr', function () {
    const testData = '0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';

    async function deployCalldataPtrMock() {
        const CalldataPtrMock = await ethers.getContractFactory('CalldataPtrMock');
        const mock = await CalldataPtrMock.deploy();
        return { mock };
    }

    describe('from', function () {
        it('should create CalldataPtr from bytes', async function () {
            const { mock } = await loadFixture(deployCalldataPtrMock);
            const ptr = await mock.from(testData);
            expect(ptr).to.not.equal(0n);
        });

        it('should create CalldataPtr from empty bytes', async function () {
            const { mock } = await loadFixture(deployCalldataPtrMock);
            const ptr = await mock.from('0x');
            // Length should be 0, so lower 128 bits should be 0
            const length = ptr & ((1n << 128n) - 1n);
            expect(length).to.equal(0n);
        });
    });

    describe('getOffsetAndLength', function () {
        it('should return correct length for data', async function () {
            const { mock } = await loadFixture(deployCalldataPtrMock);
            const [, length] = await mock.getOffsetAndLength(testData);
            expect(length).to.equal(32n);
        });

        it('should return correct length for empty data', async function () {
            const { mock } = await loadFixture(deployCalldataPtrMock);
            const [, length] = await mock.getOffsetAndLength('0x');
            expect(length).to.equal(0n);
        });

        it('should return non-zero offset', async function () {
            const { mock } = await loadFixture(deployCalldataPtrMock);
            const [offset] = await mock.getOffsetAndLength(testData);
            expect(offset).to.be.gt(0n);
        });
    });

    describe('roundTrip', function () {
        it('should return same data after from and toBytes', async function () {
            const { mock } = await loadFixture(deployCalldataPtrMock);
            const result = await mock.roundTrip(testData);
            expect(result).to.equal(testData);
        });

        it('should return empty for empty input', async function () {
            const { mock } = await loadFixture(deployCalldataPtrMock);
            const result = await mock.roundTrip('0x');
            expect(result).to.equal('0x');
        });

        it('should preserve arbitrary data', async function () {
            const { mock } = await loadFixture(deployCalldataPtrMock);
            const data = '0xdeadbeef';
            const result = await mock.roundTrip(data);
            expect(result).to.equal(data);
        });
    });
});
