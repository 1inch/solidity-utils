const { expectRevert } = require('@openzeppelin/test-helpers');

const RevertReasonParserTest = artifacts.require('RevertReasonParserTest');

contract('RevertReasonParser', function ([wallet1, wallet2]) {
    before(async function () {
        this.RevertReasonParserTest = await RevertReasonParserTest.new();
    });

    describe('parse', async function () {
        it('should be reverted with Invalid revert reason', async function () {
            await expectRevert(
                this.RevertReasonParserTest.testParseWithThrow(),
                'Invalid revert reason',
            );
        });

        it('should be parsed as empty Error', async function () {
            await this.RevertReasonParserTest.testEmptyStringRevert();
        });

        it('should be parsed as Error', async function () {
            await this.RevertReasonParserTest.testNonEmptyRevert();
        });

        it('should be parsed as Unknown', async function () {
            await this.RevertReasonParserTest.testEmptyRevert();
        });

        it('should be parsed as Panic', async function () {
            await this.RevertReasonParserTest.testAssertion();
        });

        it('should be parsed as Error with long string', async function () {
            await this.RevertReasonParserTest.testLongStringRevert();
        });

        it('should be reverted in _test()', async function () {
            await expectRevert(
                this.RevertReasonParserTest.testWithThrow(),
                'testFunctions without throw',
            );
        });

        it('should be cheaper than expensive version', async function () {
            await this.RevertReasonParserTest.testGasCost();
        });

        it('should match gas cost for parse @skip-on-coverage', async function () {
            await this.RevertReasonParserTest.testGasParse();
        });

        it('should match gas cost for expensive parse @skip-on-coverage', async function () {
            await this.RevertReasonParserTest.testGasExpensiveParse();
        });
    });
});
