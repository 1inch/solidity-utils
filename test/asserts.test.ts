import { expect } from '../src/prelude';
import { assertRoughlyEquals, assertRoughlyEqualValues } from '../src/asserts';

describe('assertRoughlyEquals', function () {
    it('should be work when values are identical', async function () {
        assertRoughlyEquals(1000000, 1000000, 1);
    });

    it('should be work when values are identical, even when significantDigits exceed the number of digits in the values', async function () {
        assertRoughlyEquals(1000000, 1000000, 10);
    });

    it('should be work when the difference between values is less than the significantDigits', async function () {
        assertRoughlyEquals(1000001, 1000000, 6);
    });

    it('should be work when the difference between values is less but negative, relative to the significantDigits', async function () {
        assertRoughlyEquals(1000000, 1000001, 6);
    });

    it('should not throw error when difference is within permitted range', async function () {
        assertRoughlyEquals(1000000, 999999, 6);
        assertRoughlyEquals(1000009, 1000010, 6);
    });

    it('should throw when significantDigits less than 1', async function () {
        expect(() => assertRoughlyEquals(1000000, 1000000, 0)).throws();
        expect(() => assertRoughlyEquals(1000000, 1000000, -2)).throws();
    });

    it('should throw when values have different signs', async function () {
        expect(() => assertRoughlyEquals(1000001, -1000000, 1)).throws();
    });

    it('should throw when values differ on the last significant digit', async function () {
        expect(() => assertRoughlyEquals(1000000, 1000001, 7)).throws();
    });

    it('should throw when difference exceeds the significant digits count', async function () {
        expect(() => assertRoughlyEquals(1012345, 1000000, 3)).throws();
    });

    it('should throw even when significant digits count is increased, but difference still exceeds it', async function () {
        expect(() => assertRoughlyEquals(1012345, 1000000, 4)).throws();
    });

    it('should handle negative values correctly', async function () {
        assertRoughlyEquals(-1000001, -1000000, 6);
        expect(() => assertRoughlyEquals(-1012345, -1000000, 4)).throws();
    });
});

describe('assertRoughlyEqualValues', function () {
    it('should be work with expected = actual, any relativeDiff', async function () {
        assertRoughlyEqualValues(1000000, 1000000, 0.000001);
    });

    it('should be work with expected = actual, relativeDiff = 0', async function () {
        assertRoughlyEqualValues(1000000, 1000000, 0);
    });

    it('should be work with diff between expected and actual less than relativeDiff * expected', async function () {
        assertRoughlyEqualValues(1000001, 1000000, 1.000001);
    });

    it('should be work with negative diff between expected and actual less than relativeDiff * expected', async function () {
        assertRoughlyEqualValues(1000000, 1000001, 0.000001);
    });

    it('should be work with diff between expected and actual equals to relativeDiff', async function () {
        assertRoughlyEqualValues(1000000, 1000001, 1);
    });

    it('works on negative', async function () {
        assertRoughlyEqualValues(-1000001, -1000000, 1.000001);
    });

    it('different signs throws', async function () {
        expect(() => assertRoughlyEqualValues(1000001, -1000000, 1.000001)).throws();
    });

    it('should be thrown with expected != actual with relativeDiff = 0', async function () {
        expect(() => assertRoughlyEqualValues(1000000, 1000001, 0)).throws();
    });

    it('should be thrown with expected > actual more than relativeDiff * expected', async function () {
        expect(() => assertRoughlyEqualValues(1000001, 1000000, 0.0000001)).throws();
    });

    it('should be thrown with expected < actual more than relativeDiff * expected', async function () {
        expect(() => assertRoughlyEqualValues(1000000, 1000001, 0.0000001)).throws();
    });
});
