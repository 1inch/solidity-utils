const { expect } = require('chai');
const { assertThrowsAsync, assertRoughlyEqualValues } = require('../js/asserts.js');

describe('assertThrowsAsync', async function () {
    async function action () {
        throw new Error('Test throw message');
    }

    it('shouldn\'t be thrown', async function () {
        try {
            await assertThrowsAsync(action, 'Test throw message');
        } catch (e) {
            expect(true).equal(false);
        }
    });

    it('should be thrown with no expected message', async function () {
        try {
            await assertThrowsAsync(action, 'Another test throw message');
        } catch (e) {
            expect(e.message).equal('expected \'Test throw message\' to include \'Another test throw message\'');
            return;
        }
        expect(true).equal(false);
    });

    it('should be thrown because function doesn\'t have throw', async function () {
        try {
            await assertThrowsAsync(async function () {}, 'Test throw message');
        } catch (e) {
            expect(e.message).equal('Should have thrown an error but didn\'t');
            return;
        }
        expect(true).equal(false);
    });
});

describe('assertRoughlyEqualValues', async function () {
    function shouldNotThrow (expected, actual, relativeDiff) {
        try {
            assertRoughlyEqualValues(expected, actual, relativeDiff);
        } catch (e) {
            expect(true).equal(false);
        }
    }

    function shouldThrow (expected, actual, relativeDiff) {
        try {
            assertRoughlyEqualValues(expected, actual, relativeDiff);
        } catch (e) {
            expect(e.message).equal(`${actual} != ${expected} with ${relativeDiff} precision: expected '${actual}' to equal '${expected}'`);
            return;
        }
        expect(true).equal(false);
    }

    it('should be work with expected = actual, any relativeDiff', async function () {
        shouldNotThrow(1000000, 1000000, 0.000001);
    });

    it('should be work with expected = actual, relativeDiff = 0', async function () {
        shouldNotThrow(1000000, 1000000, 0);
    });

    it('should be work with diff between expected and actual less than relativeDiff * expected', async function () {
        shouldNotThrow(1000001, 1000000, 1.000001);
    });

    it('should be work with negative diff between expected and actual less than relativeDiff * expected', async function () {
        shouldNotThrow(1000000, 1000001, 0.000001);
    });

    it('should be work with diff between expected and actual equals to relativeDiff', async function () {
        shouldNotThrow(1000000, 1000001, 1);
    });

    it('should be thrown with expected != actual with relativeDiff = 0', async function () {
        shouldThrow(1000000, 1000001, 0);
    });

    it('should be thrown with expected > actual more than relativeDiff * expected', async function () {
        shouldThrow(1000001, 1000000, 0.0000001);
    });

    it('should be thrown with expected < actual more than relativeDiff * expected', async function () {
        shouldThrow(1000000, 1000001, 0.0000001);
    });
});
