const { BN } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const StringUtilsMock = artifacts.require('StringUtilTest');
// const GasEstimator = artifacts.require('GasEstimator');

describe('StringUtil', async function () {
    before(async () => {
        this.stringUtilsMock = await StringUtilsMock.new();
        // this.gasEstimator = await GasEstimator.new();
    });

    it.only('gas check', async () => {
        await this.stringUtilsMock.toHexGasCheck(
            '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 917
        );
    });

    it('Uint 256', () => test(new BN(0).notn(256), 
        '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'));
    it('Uint 128', () => test(new BN(0).notn(128), 
        '0x00000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'));
    it('Very long byte array', () => 
        testBytes('0xffffffffffffffafafafbcbcbcbcbdeded' + 'aa'.repeat(50)));
    it('Very long byte array', () => 
        testBytes('0xffffffffffffffafafafbcbcbcbcbdeded' + 'aa'.repeat(500)));
    it('Extremely long byte array', () => 
        testBytes('0x' + '0f'.repeat(1000)));
    it('Extremely long byte array', () => 
        testBytes('0x' + '0f'.repeat(100)));
    it('Extremely long byte array', () => 
        testBytes('0x' + '0f'.repeat(10000)));

    it('Very long byte array gas @skip-on-coverage', () =>
        testGas('0xffffffffffffffafafafbcbcbcbcbdeded' + 'aa'.repeat(50), 25692));
    it('Extremely long byte array gas @skip-on-coverage', () => 
        testGas('0x' + '0f'.repeat(1000), 62038));

    it('Very long byte array gas naive @skip-on-coverage', () =>
        testGasNaive('0xffffffffffffffafafafbcbcbcbcbdeded' + 'aa'.repeat(50), 52740));
    it('Extremely long byte array gas naive @skip-on-coverage', () =>
        testGasNaive('0x' + '0f'.repeat(1000), 469753));

    const test = async (value, expectedString) => {
        const result = await this.stringUtilsMock.contract.methods.toHex(value).call();
        const tx = await this.stringUtilsMock.toHex(value);
        const naiveResult = await this.stringUtilsMock.contract.methods.toHexNaive(value).call();
        const txNaive = await this.stringUtilsMock.toHexNaive(value);
        expect(result.toLowerCase()).to.be.equal(expectedString.toLowerCase());
        expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
        expect(tx.receipt.gasUsed).to.be.lte(txNaive.receipt.gasUsed);
        console.log(`${result}: ${tx.receipt.gasUsed}-${txNaive.receipt.gasUsed}`);
    };
    
    const testBytes = async (value) => {
        const result = await this.stringUtilsMock.toHexBytes(value);
        const tx = await this.gasEstimator.gasCost.sendTransaction(
            this.stringUtilsMock.address, this.stringUtilsMock.contract.methods.toHexBytes(value).encodeABI()
        );
        const naiveResult = await this.stringUtilsMock.toHexNaiveBytes(value);
        const txNaive = await this.stringUtilsMock.toHexNaiveBytes.sendTransaction(value);
        expect(result.toLowerCase()).to.be.equal(value.toLowerCase());
        expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
        expect(tx.receipt.gasUsed).to.be.lte(txNaive.receipt.gasUsed);
        const gasResult = await this.gasEstimator.gasCost(
            this.stringUtilsMock.address, this.stringUtilsMock.contract.methods.toHexBytes(value).encodeABI()
        );
        console.log(`${0}: ${tx.receipt.gasUsed}-${txNaive.receipt.gasUsed}`);
        console.log(`${gasResult.gasUsed.toString()} (diff ${new BN(tx.receipt.gasUsed).sub(gasResult.gasUsed)})`);
    };

    const testGas = async (value, expectedGas) => {
        const tx = await this.stringUtilsMock.toHexBytes(value);
        expect(tx.receipt.gasUsed).to.be.eq(expectedGas);
    };

    const testGasNaive = async (value, expectedGas) => {
        const tx = await this.stringUtilsMock.toHexNaiveBytes(value);
        expect(tx.receipt.gasUsed).to.be.eq(expectedGas);
    };
});
