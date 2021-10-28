const { BN } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const StringUtilsMock = artifacts.require('StringUtilsMock');

describe('StringUtil', function () {
    before(async () => {
        this.stringUtilsMock = await StringUtilsMock.new();
    });

    it('Uint 256', () => test(new BN(0).notn(256)));
    it('Uint 128', () => test(new BN(0).notn(128)));
    it('Very long byte array', () => testBytes('0xffffffffffffffafafafbcbcbcbcbdeded' + 'aa'.repeat(50)));
    it('Extremely long byte array', () => testBytes('0x' + '0f'.repeat(1000)));

    const test = async (value) => {
        const result = await this.stringUtilsMock.contract.methods.toHex(value).call();
        const tx = await this.stringUtilsMock.toHex(value);
        const naiveResult = await this.stringUtilsMock.contract.methods.toHexNaive(value).call();
        const txNaive = await this.stringUtilsMock.toHexNaive(value);
        expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
        expect(tx.receipt.gasUsed).to.be.lte(txNaive.receipt.gasUsed);
        console.log(`${result}: ${tx.receipt.gasUsed}-${txNaive.receipt.gasUsed}`);
    };
    
    const testBytes = async (value) => {
        const result = await this.stringUtilsMock.contract.methods.toHexBytes(value).call();
        const tx = await this.stringUtilsMock.toHexBytes(value);
        const naiveResult = await this.stringUtilsMock.contract.methods.toHexNaiveBytes(value).call();
        const txNaive = await this.stringUtilsMock.toHexNaiveBytes(value);
        expect(result.toLowerCase()).to.be.equal(naiveResult.toLowerCase());
        expect(tx.receipt.gasUsed).to.be.lte(txNaive.receipt.gasUsed);
        console.log(`${result}: ${tx.receipt.gasUsed}-${txNaive.receipt.gasUsed}`);
    };
});
