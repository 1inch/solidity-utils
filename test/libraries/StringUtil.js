const { expect } = require('chai');

const StringUtilTest = artifacts.require('StringUtilTest');

describe('StringUtil', async () => {
    const uint256TestValue = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
    const uint128TestValue = '0x00000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
    const veryLongArray = '0xffffffffffffffafafafbcbcbcbcbdeded' + 'aa'.repeat(50);
    const extremelyLongArray = '0x' + '0f'.repeat(1000);
    const emptyBytes = '0x';
    const singleByte = '0xaf';

    before(async () => {
        this.stringUtilTest = await StringUtilTest.new();
    });

    describe('Validity', async () => {
        it('Uint 256', () => test(uint256TestValue));

        it('Uint 128', () => test(uint128TestValue));

        it('Very long byte array', () => testBytes(veryLongArray));

        it('Extremely long byte array', () => testBytes(extremelyLongArray));

        it('Empty bytes. Skipped until resolved: https://github.com/ChainSafe/web3.js/issues/4512', () => testBytes(emptyBytes));

        it('Single byte', () => testBytes(singleByte));

        const test = async (value) => {
            const result = await this.stringUtilTest.toHex(value, 0);
            const naiveResult = await this.stringUtilTest.toHexNaive(value, 0);
            expect(result.toLowerCase()).to.be.equal(value.toLowerCase());
            expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
        };

        const testBytes = async (value) => {
            const result = await this.stringUtilTest.toHexBytes(value, 0);
            const naiveResult = await this.stringUtilTest.toHexNaiveBytes(value, 0);
            expect(result.toLowerCase()).to.be.equal(value.toLowerCase());
            expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
        };
    });

    describe('Gas usage @skip-on-coverage', async () => {
        it('Uint 256', () => testGasUint256(uint256TestValue, 917));

        it('Uint 256 naive', () => testGasNaiveUint256(uint256TestValue, 14175));

        it('Uint 256 as bytes', () => testGasBytes(uint256TestValue, 792));

        it('Uint 256 as bytes naive', () => testGasNaiveBytes(uint256TestValue, 14050));

        it('Uint 128', () => testGasUint256(uint128TestValue, 917));

        it('Uint 128 naive', () => testGasNaiveUint256(uint128TestValue, 14175));

        it('Very long byte array gas', () => testGasBytes(veryLongArray, 1974));

        it('Very long byte array gas naive', () => testGasNaiveBytes(veryLongArray, 28972));

        it('Extremely long byte array gas', () => testGasBytes(extremelyLongArray, 19131));

        it('Extremely long byte array gas naive', () => testGasNaiveBytes(extremelyLongArray, 426795));

        it('Empty bytes', () => testGasBytes(emptyBytes, 201));

        it('Empty bytes naive', () => testGasNaiveBytes(emptyBytes, 406));

        it('Single byte', () => testGasBytes(singleByte, 792));

        it('Single byte naive', () => testGasNaiveBytes(singleByte, 832));

        const testGasUint256 = async (value, expectedGas) => {
            await this.stringUtilTest.toHex(value, expectedGas);
        };

        const testGasBytes = async (value, expectedGas) => {
            await this.stringUtilTest.toHexBytes(value, expectedGas);
        };

        const testGasNaiveUint256 = async (value, expectedGas) => {
            await this.stringUtilTest.toHexNaive(value, expectedGas);
        };

        const testGasNaiveBytes = async (value, expectedGas) => {
            await this.stringUtilTest.toHexNaiveBytes(value, expectedGas);
        };
    });
});
