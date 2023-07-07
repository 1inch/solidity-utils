import { expect } from './prelude';

export function assertRoughlyEquals(
    expected: string | number | bigint,
    actual: string | number | bigint,
    significantDigits: number,
) {
    expect(significantDigits).to.be.gte(1, 'significantDigits must be more than 1');

    let expectedBN = BigInt(expected);
    let actualBN = BigInt(actual);
    expect(expectedBN * actualBN).to.be.gte(0, 'Values are of different sign');

    if (expectedBN < 0) expectedBN = -expectedBN;
    if (actualBN < 0) actualBN = -actualBN;

    const differenceBN = expectedBN > actualBN ? expectedBN - actualBN : actualBN - expectedBN;
    const minExpectedOrActualBN = expectedBN < actualBN ? expectedBN : actualBN;

    const valid = differenceBN * (10n ** BigInt(significantDigits - 1)) < minExpectedOrActualBN;
    if (!valid) {
        expect(actualBN).to.equal(expectedBN, `${actual} != ${expected} with at least ${significantDigits} significant digits`);
    }
}

export function assertRoughlyEqualValues(
    expected: string | number | bigint,
    actual: string | number | bigint,
    relativeDiff: number,
) {
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
