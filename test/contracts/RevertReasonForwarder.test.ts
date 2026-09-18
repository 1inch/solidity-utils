import { getNetworkConnection } from '../../src/network.js';
import { expect } from '../../src/expect.js';
import {
    RevertReasonForwarderHelper__factory as RevertReasonForwarderHelper,
    RevertReasonForwarderMock__factory as RevertReasonForwarderMock,
} from '../../typechain-types/index.js';

const { ethers, networkHelpers } = await getNetworkConnection();


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
        const { helper, mock } = await networkHelpers.loadFixture(deployRevertReasonForwarderMock);
        await expect(mock.reRevert()).to.be.revertedWithCustomError(helper, 'RevertReason');
    });

    it('should return custom error from the helper contract using reReason', async function () {
        const { mock } = await networkHelpers.loadFixture(deployRevertReasonForwarderMock);
        expect(await mock.reReason.staticCall()).to.be.equal(ethers.id('RevertReason()').substring(0, 10));
    });
});
