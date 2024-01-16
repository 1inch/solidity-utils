import { Assertion, AssertionError, assert, expect, config, should, use } from 'chai';
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot';

use(jestSnapshotPlugin());

export function assertRoughlyEqualValues(
    expected: string | number | bigint,
    actual: string | number | bigint,
    relativeDiff: number,
): void {
    let expectedBN = BigInt(expected);
    let actualBN = BigInt(actual);
    expect(expectedBN * actualBN).to.be.gte(0, 'Values are of different sign');

    if (expectedBN < 0) expectedBN = -expectedBN;
    if (actualBN < 0) actualBN = -actualBN;

    let multiplerNumerator = relativeDiff;
    let multiplerDenominator = 1n;
    while (!Number.isInteger(multiplerNumerator)) {
        multiplerDenominator = multiplerDenominator * 10n;
        multiplerNumerator *= 10;
    }
    const diff = expectedBN > actualBN ? expectedBN - actualBN : actualBN - expectedBN;
    const treshold = (expectedBN * BigInt(multiplerNumerator)) / multiplerDenominator;
    if (diff > treshold) {
        expect(actualBN).to.be.equal(expectedBN, `${actual} != ${expected} with ${relativeDiff} precision`);
    }
}

// chai
export { Assertion, AssertionError, assert, expect, config, should };
