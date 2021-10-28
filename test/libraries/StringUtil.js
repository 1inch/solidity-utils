const { expect } = require('chai');

const StringUtilsMock = artifacts.require('StringUtilTest');

describe('StringUtil', async () => {
    const uint256TestValue = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
    const uint128TestValue = '0x00000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
    const veryLongArray = '0xffffffffffffffafafafbcbcbcbcbdeded' + 'aa'.repeat(50);
    const extremelyLongArray = '0x' + '0f'.repeat(1000);

    before(async () => {
        this.stringUtilsMock = await StringUtilsMock.new();
    });

    describe('Validity', async () => {
        it('Uint 256', () => test(uint256TestValue));
        it('Uint 128', () => test(uint128TestValue));
        it('Very long byte array', () => testBytes(veryLongArray));
        it('Extremely long byte array', () => testBytes(extremelyLongArray));

        const test = async (value) => {
            const result = await this.stringUtilsMock.toHex(value, 0);
            const naiveResult = await this.stringUtilsMock.toHexNaive(value, 0);
            expect(result.toLowerCase()).to.be.equal(value.toLowerCase());
            expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
        };

        const testBytes = async (value) => {
            const result = await this.stringUtilsMock.toHexBytes(value, 0);
            const naiveResult = await this.stringUtilsMock.toHexNaiveBytes(value, 0);
            expect(result.toLowerCase()).to.be.equal(value.toLowerCase());
            expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
        };
    });

    describe('Gas usage @skip-on-coverage', async () => {
        it('Uint 256', () =>
            testGasUint256(uint256TestValue, 917));

        it('Uint 256 naive', () =>
            testGasNaiveUint256(uint256TestValue, 14175));

        it('Uint 256 as bytes', () =>
            testGasBytes(uint256TestValue, 792));

        it('Uint 256 as bytes naive', () =>
            testGasNaiveBytes(uint256TestValue, 14050));

        it('Uint 128', () =>
            testGasUint256(uint128TestValue, 917));

        it('Uint 127 naive', () =>
            testGasNaiveUint256(uint128TestValue, 14175));

        it('Very long byte array gas', () =>
            testGasBytes(veryLongArray, 1974));

        it('Very long byte array gas naive', () =>
            testGasNaiveBytes(veryLongArray, 28972));

        it('Extremely long byte array gas', () =>
            testGasBytes(extremelyLongArray, 19131));

        it('Extremely long byte array gas naive', () =>
            testGasNaiveBytes(extremelyLongArray, 426795));

        const testGasUint256 = async (value, expectedGas) => {
            await this.stringUtilsMock.toHex(value, expectedGas);
        };

        const testGasBytes = async (value, expectedGas) => {
            await this.stringUtilsMock.toHexBytes(value, expectedGas);
        };

        const testGasNaiveUint256 = async (value, expectedGas) => {
            await this.stringUtilsMock.toHexNaive(value, expectedGas);
        };

        const testGasNaiveBytes = async (value, expectedGas) => {
            await this.stringUtilsMock.toHexNaiveBytes(value, expectedGas);
        };
    });
});
