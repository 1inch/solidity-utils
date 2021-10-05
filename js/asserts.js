const { expect } = require('chai');
const { BN } = require('@openzeppelin/test-helpers');

async function assertThrowsAsync (action, msg) {
    try {
        await action();
    } catch (e) {
        expect(e.message).to.contain(msg);
        return;
    }
    throw new Error('Should have thrown an error but didn\'t');
}

function assertRoughlyEqualValues (expected, actual, relativeDiff) {
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

module.exports = {
    assertThrowsAsync,
    assertRoughlyEqualValues,
};
