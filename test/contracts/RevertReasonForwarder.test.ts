import { expect } from '../../src/expect';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import {
    RevertReasonForwarderHelper__factory as RevertReasonForwarderHelper,
    RevertReasonForwarderMock__factory as RevertReasonForwarderMock,
} from '../../typechain-types';

describe('RevertReasonForwarder', function () {
    let Helper: RevertReasonForwarderHelper;
    let RevertReasonForwarderMock: RevertReasonForwarderMock;

    async function deployRevertReasonForwarderMock() {
        RevertReasonForwarderMock = await ethers.getContractFactory('RevertReasonForwarderMock');
        Helper = await ethers.getContractFactory('RevertReasonForwarderHelper');
        const helper = await Helper.deploy();
        const mock = await RevertReasonForwarderMock.deploy(helper);
        return { helper, mock };
    }

    it('should forward custom error from the helper contract using reRevert', async function () {
        const { helper, mock } = await loadFixture(deployRevertReasonForwarderMock);
        await expect(mock.reRevert()).to.be.revertedWithCustomError(helper, 'RevertReason');
    });

    it('should return custom error from the helper contract using reReason', async function () {
        const { mock } = await loadFixture(deployRevertReasonForwarderMock);
        expect(await mock.reReason.staticCall()).to.be.equal(ethers.id('RevertReason()').substring(0, 10));
    });
});
