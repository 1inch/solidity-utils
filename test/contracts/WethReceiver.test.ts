import { getNetworkConnection } from '../../src/network.js';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import { expect } from '../../src/expect.js';

const { ethers, networkHelpers } = await getNetworkConnection();


describe('WethReceiver', function () {
    let signer1: HardhatEthersSigner;

    before(async function () {
        [signer1] = await ethers.getSigners();
    });

    async function deployMocks() {
        const EthSenderMock = await ethers.getContractFactory('EthSenderMock');
        const ethSenderMock = await EthSenderMock.deploy();

        const WethReceiverMock = await ethers.getContractFactory('WethReceiverMock');
        const wethReceiverMock = await WethReceiverMock.deploy(ethSenderMock);

        return { wethReceiverMock, ethSenderMock };
    }

    it('contract transfer', async function () {
        const { wethReceiverMock, ethSenderMock } = await networkHelpers.loadFixture(deployMocks);
        await ethSenderMock.transfer(wethReceiverMock, { value: 100 });
    });

    it('normal transfer', async function () {
        const { wethReceiverMock } = await networkHelpers.loadFixture(deployMocks);
        await expect(
            signer1.sendTransaction({ to: wethReceiverMock, value: 100 }),
        ).to.be.revertedWithCustomError(wethReceiverMock, 'EthDepositRejected');
    });
});
