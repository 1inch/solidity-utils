
import { expect } from '../../helpers/prelude';

const RevertReasonParserTest = artifacts.require('RevertReasonParserTest');

describe('RevertReasonParser', async () => {
    const initContext = async () => {
        const revertReasonParserTest = await RevertReasonParserTest.new();
        return { revertReasonParserTest };
    };

    let context: Awaited<ReturnType<typeof initContext>> = undefined!;

    before(async () => {
        context = await initContext();
    });

    describe('parse', async function () {
        it('should be reverted with Invalid revert reason', async function () {
            expect(context.revertReasonParserTest.testParseWithThrow())
                .to.eventually.be.rejectedWith('Invalid revert reason');
        });

        it('should be parsed as empty Error', async function () {
            await context.revertReasonParserTest.testEmptyStringRevert();
        });

        it('should be parsed as Error', async function () {
            await context.revertReasonParserTest.testNonEmptyRevert();
        });

        it('should be parsed as Unknown', async function () {
            await context.revertReasonParserTest.testEmptyRevert();
        });

        it('should be parsed as Panic', async function () {
            await context.revertReasonParserTest.testAssertion();
        });

        it('should be parsed as Error with long string', async function () {
            await context.revertReasonParserTest.testLongStringRevert();
        });

        it('should be reverted in _test()', async function () {
            expect(context.revertReasonParserTest.testWithThrow())
                .to.eventually.be.rejectedWith('testFunctions without throw');
        });
    });
});
