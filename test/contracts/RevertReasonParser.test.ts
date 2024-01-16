import { expect } from '../../src/expect';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('RevertReasonParser', function () {
    async function deployRevertReasonParserTest() {
        const RevertReasonParserTest = await ethers.getContractFactory('RevertReasonParserTest');
        const revertReasonParserTest = await RevertReasonParserTest.deploy();
        return { revertReasonParserTest };
    }


    it('should be parsed as Unknown (Invalid revert reason)', async function () {
        const { revertReasonParserTest } = await loadFixture(deployRevertReasonParserTest);
        await revertReasonParserTest.testParseWithThrow();
    });

    it('should be parsed as empty Error', async function () {
        const { revertReasonParserTest } = await loadFixture(deployRevertReasonParserTest);
        await revertReasonParserTest.testEmptyStringRevert();
    });

    it('should be parsed as Error', async function () {
        const { revertReasonParserTest } = await loadFixture(deployRevertReasonParserTest);
        await revertReasonParserTest.testNonEmptyRevert();
    });

    it('should be parsed as Unknown', async function () {
        const { revertReasonParserTest } = await loadFixture(deployRevertReasonParserTest);
        await revertReasonParserTest.testEmptyRevert();
    });

    it('should be parsed as Panic', async function () {
        const { revertReasonParserTest } = await loadFixture(deployRevertReasonParserTest);
        await revertReasonParserTest.testAssertion();
    });

    it('should be parsed as Error with long string', async function () {
        const { revertReasonParserTest } = await loadFixture(deployRevertReasonParserTest);
        await revertReasonParserTest.testLongStringRevert();
    });

    it('should be reverted in _test()', async function () {
        const { revertReasonParserTest } = await loadFixture(deployRevertReasonParserTest);
        await expect(revertReasonParserTest.testWithThrow()).to.be.revertedWithCustomError(
            revertReasonParserTest,
            'TestDidNotThrow',
        );
    });
});
