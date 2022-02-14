import { expect } from 'chai';
const { BN } = require('@openzeppelin/test-helpers');

export function assertRoughlyEqualValues (expected: string | number, actual: string | number, relativeDiff: number) {
    const expectedBN = new BN(expected);
    const actualBN = new BN(actual);

    let multiplerNumerator = relativeDiff;
    let multiplerDenominator = new BN('1');
    while (!Number.isInteger(multiplerNumerator)) {
        multiplerDenominator = multiplerDenominator.mul(new BN('10'));
        multiplerNumerator *= 10;
    }
    const diff = expectedBN.sub(actualBN).abs();
    const treshold = expectedBN.mul(new BN(multiplerNumerator.toString())).div(multiplerDenominator);
    if (!diff.lte(treshold)) {
        expect(actualBN).to.be.bignumber.equal(expectedBN, `${actualBN} != ${expectedBN} with ${relativeDiff} precision`);
    }
}
