import { expect, toBN } from './prelude';

export function assertRoughlyEqualValues (expected: string | number, actual: string | number, relativeDiff: number) {
    const expectedBN = toBN(expected);
    const actualBN = toBN(actual);

    let multiplerNumerator = relativeDiff;
    let multiplerDenominator = toBN('1');
    while (!Number.isInteger(multiplerNumerator)) {
        multiplerDenominator = multiplerDenominator.mul(toBN('10'));
        multiplerNumerator *= 10;
    }
    const diff = expectedBN.sub(actualBN).abs();
    const treshold = expectedBN.mul(toBN(multiplerNumerator.toString())).div(multiplerDenominator);
    if (!diff.lte(treshold)) {
        expect(actualBN).to.be.bignumber.equal(expectedBN, `${actualBN} != ${expectedBN} with ${relativeDiff} precision`);
    }
}
