import { expect, toBN } from './prelude';
import BN from "bn.js";

export function toBNExtended (value: string | number | BN): BN {
    if (typeof value === 'string' || typeof value === 'number') {
        return toBN(value);
    }
    return value;
}

export function assertRoughlyEqualValues (expected: string | number | BN, actual: string | number | BN, relativeDiff: number) {
    const expectedBN = toBNExtended(expected);
    const actualBN = toBNExtended(actual);

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
