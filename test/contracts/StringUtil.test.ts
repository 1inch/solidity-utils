import { expect } from '../../src/prelude';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('StringUtil', async () => {
    const uint256TestValue = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
    const uint128TestValue = '0x00000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
    const veryLongArray = '0xffffffffffffffafafafbcbcbcbcbdeded' + 'aa'.repeat(50);
    const extremelyLongArray = '0x' + '0f'.repeat(1000);
    const emptyBytes = '0x';
    const singleByte = '0xaf';
    const randomBytes = '0x01de89fff130adeaad';
    const sameBytesShort = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const sameBytesLong = '0x' + 'aa'.repeat(1000);

    const deployStringUtilTest = async () => {
        const StringUtilTest = await ethers.getContractFactory('StringUtilTest');
        const stringUtilTest = await StringUtilTest.deploy();
        return { stringUtilTest };
    };

    describe('Validity', async () => {
        it('Uint 256', () => test(uint256TestValue));

        it('Uint 128', () => test(uint128TestValue));

        it('Very long byte array', () => testBytes(veryLongArray));

        it('Extremely long byte array', () => testBytes(extremelyLongArray));

        it('Empty bytes', () => testBytes(emptyBytes));

        it('Single byte', () => testBytes(singleByte));

        it('Random bytes', () => testBytes(randomBytes));

        it('Same bytes short', () => testBytes(sameBytesShort));

        it('Same bytes long', () => testBytes(sameBytesLong));

        it('Single byte naive', () => testIncorrectGas(singleByte, 2000));

        const test = async (value: string) => {
            const { stringUtilTest } = await loadFixture(deployStringUtilTest);
            const result = await stringUtilTest.toHex(value, 0);
            const naiveResult = await stringUtilTest.toHexNaive(value, 0);
            expect(result.toLowerCase()).to.be.equal(value.toLowerCase());
            expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
        };

        const testBytes = async (value: string) => {
            const { stringUtilTest } = await loadFixture(deployStringUtilTest);
            const result = await stringUtilTest.toHexBytes(value, 0);
            const naiveResult = await stringUtilTest.toHexNaiveBytes(value, 0);
            expect(result.toLowerCase()).to.be.equal(value.toLowerCase());
            expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
        };

        const testIncorrectGas = async (value: string, expectedGas: number) => {
            const { stringUtilTest } = await loadFixture(deployStringUtilTest);
            await expect(stringUtilTest.toHexNaiveBytes(value, expectedGas)).to.be.revertedWithCustomError(
                stringUtilTest,
                'GasCostDiffers',
            );
        };
    });

    describe('Gas usage @skip-on-coverage', async () => {
        it('Uint 256', () => testGasUint256(uint256TestValue, 907));

        it('Uint 256 naive', () => testGasNaiveUint256(uint256TestValue, 14175));

        it('Uint 256 as bytes', () => testGasBytes(uint256TestValue, 782));

        it('Uint 256 as bytes naive', () => testGasNaiveBytes(uint256TestValue, 14050));

        it('Uint 128', () => testGasUint256(uint128TestValue, 907));

        it('Uint 128 naive', () => testGasNaiveUint256(uint128TestValue, 14175));

        it('Very long byte array gas', () => testGasBytes(veryLongArray, 1964));

        it('Very long byte array gas naive', () => testGasNaiveBytes(veryLongArray, 28972));

        it('Extremely long byte array gas', () => testGasBytes(extremelyLongArray, 19121));

        it('Extremely long byte array gas naive', () => testGasNaiveBytes(extremelyLongArray, 426795));

        it('Empty bytes', () => testGasBytes(emptyBytes, 191));

        it('Empty bytes naive', () => testGasNaiveBytes(emptyBytes, 406));

        it('Single byte', () => testGasBytes(singleByte, 782));

        it('Single byte naive', () => testGasNaiveBytes(singleByte, 832));

        const testGasUint256 = async (value: string, expectedGas: number) => {
            const { stringUtilTest } = await loadFixture(deployStringUtilTest);
            await stringUtilTest.toHex(value, expectedGas);
        };

        const testGasBytes = async (value: string, expectedGas: number) => {
            const { stringUtilTest } = await loadFixture(deployStringUtilTest);
            await stringUtilTest.toHexBytes(value, expectedGas);
        };

        const testGasNaiveUint256 = async (value: string, expectedGas: number) => {
            const { stringUtilTest } = await loadFixture(deployStringUtilTest);
            await stringUtilTest.toHexNaive(value, expectedGas);
        };

        const testGasNaiveBytes = async (value: string, expectedGas: number) => {
            const { stringUtilTest } = await loadFixture(deployStringUtilTest);
            await stringUtilTest.toHexNaiveBytes(value, expectedGas);
        };
    });
});
