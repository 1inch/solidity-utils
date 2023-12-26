import { expect } from '../../src/prelude';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre, { ethers } from 'hardhat';

describe('StringUtil', function () {
    const uint256TestValue = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
    const uint128TestValue = '0x00000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
    const veryLongArray = '0xffffffffffffffafafafbcbcbcbcbdeded' + 'aa'.repeat(50);
    const extremelyLongArray = '0x' + '0f'.repeat(1000);
    const emptyBytes = '0x';
    const singleByte = '0xaf';
    const randomBytes = '0x01de89fff130adeaad';
    const sameBytesShort = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const sameBytesLong = '0x' + 'aa'.repeat(1000);

    async function deployStringUtilTest() {
        const StringUtilTest = await ethers.getContractFactory('StringUtilTest');
        const stringUtilTest = await StringUtilTest.deploy();
        return { stringUtilTest };
    }

    describe('Validity', function () {
        it('Uint 256', () => test(uint256TestValue));

        it('Uint 128', () => test(uint128TestValue));

        it('Very long byte array', () => testBytes(veryLongArray));

        it('Extremely long byte array', () => testBytes(extremelyLongArray));

        it('Empty bytes', () => testBytes(emptyBytes));

        it('Single byte', () => testBytes(singleByte));

        it('Random bytes', () => testBytes(randomBytes));

        it('Same bytes short', () => testBytes(sameBytesShort));

        it('Same bytes long', () => testBytes(sameBytesLong));

        async function test(value: string) {
            const { stringUtilTest } = await loadFixture(deployStringUtilTest);
            const result = await stringUtilTest.toHex(value);
            const naiveResult = await stringUtilTest.toHexNaive(value);
            expect(result.toLowerCase()).to.be.equal(value.toLowerCase());
            expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
        }

        async function testBytes(value: string) {
            const { stringUtilTest } = await loadFixture(deployStringUtilTest);
            const result = await stringUtilTest.toHexBytes(value);
            const naiveResult = await stringUtilTest.toHexNaiveBytes(value);
            expect(result.toLowerCase()).to.be.equal(value.toLowerCase());
            expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
        }
    });

    describe('Gas usage', function () {
        before(function () {
            if (hre.__SOLIDITY_COVERAGE_RUNNING) { this.skip(); }
        });

        it('Uint 256', () => testGasUint256(uint256TestValue));

        it('Uint 256 naive', () => testGasNaiveUint256(uint256TestValue));

        it('Uint 256 as bytes', () => testGasBytes(uint256TestValue));

        it('Uint 256 as bytes naive', () => testGasNaiveBytes(uint256TestValue));

        it('Uint 128', () => testGasUint256(uint128TestValue));

        it('Uint 128 naive', () => testGasNaiveUint256(uint128TestValue));

        it('Very long byte array gas', () => testGasBytes(veryLongArray));

        it('Very long byte array gas naive', () => testGasNaiveBytes(veryLongArray));

        it('Extremely long byte array gas', () => testGasBytes(extremelyLongArray));

        it('Extremely long byte array gas naive', () => testGasNaiveBytes(extremelyLongArray));

        it('Empty bytes', () => testGasBytes(emptyBytes));

        it('Empty bytes naive', () => testGasNaiveBytes(emptyBytes));

        it('Single byte', () => testGasBytes(singleByte));

        it('Single byte naive', () => testGasNaiveBytes(singleByte));

        async function testGasUint256(value: string) {
            const { stringUtilTest } = await loadFixture(deployStringUtilTest);
            const tx = await (await stringUtilTest.toHex.send(value)).wait();
            const gasUsed = tx!.gasUsed;

            expect(gasUsed).toMatchSnapshot();
        }

        async function testGasBytes(value: string) {
            const { stringUtilTest } = await loadFixture(deployStringUtilTest);
            const tx = await (await stringUtilTest.toHexBytes.send(value)).wait();
            const gasUsed = tx!.gasUsed;

            expect(gasUsed).toMatchSnapshot();
        }

        async function testGasNaiveUint256(value: string) {
            const { stringUtilTest } = await loadFixture(deployStringUtilTest);
            const tx = await (await stringUtilTest.toHexNaive.send(value)).wait();
            const gasUsed = tx!.gasUsed;

            expect(gasUsed).toMatchSnapshot();
        }

        async function testGasNaiveBytes(value: string) {
            const { stringUtilTest } = await loadFixture(deployStringUtilTest);
            const tx = await (await stringUtilTest.toHexNaiveBytes.send(value)).wait();
            const gasUsed = tx!.gasUsed;

            expect(gasUsed).toMatchSnapshot();
        }
    });
});
