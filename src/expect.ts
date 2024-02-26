import { Assertion, AssertionError, assert, expect, config, should } from 'chai';

/**
 * @category expect
 * @dev Asserts that two values are roughly equal within a specified relative difference.
 * This function is useful for cases where precision issues might cause direct comparisons to fail.
 * @param expected The expected value as a string, number, or bigint.
 * @param actual The actual value obtained, to compare against the expected value.
 * @param relativeDiff The maximum allowed relative difference between the expected and actual values.
 * The relative difference is calculated as the absolute difference divided by the expected value,
 * ensuring that the actual value is within this relative difference from the expected value.
 * @notice This function will revert with a message if the values are of different signs
 * or if the actual value deviates from the expected by more than the specified relative difference.
 */
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
