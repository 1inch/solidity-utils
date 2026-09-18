import { getNetworkConnection } from '../../src/network.js';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import { expect } from '../../src/expect.js';

const { ethers, networkHelpers } = await getNetworkConnection();


describe('EthReceiver', function () {
    let signer1: HardhatEthersSigner;

    before(async function () {
        [signer1] = await ethers.getSigners();
    });

    async function deployMocks() {
        const EthReceiverMock = await ethers.getContractFactory('EthReceiverMock');
        const ethReceiverMock = await EthReceiverMock.deploy();

        const EthSenderMock = await ethers.getContractFactory('EthSenderMock');
        const ethSenderMock = await EthSenderMock.deploy();
        return { ethReceiverMock, ethSenderMock };
    }

    it('contract transfer', async function () {
        const { ethReceiverMock, ethSenderMock } = await networkHelpers.loadFixture(deployMocks);
        await ethSenderMock.transfer(ethReceiverMock, { value: 100 });
    });

    it('normal transfer', async function () {
        const { ethReceiverMock } = await networkHelpers.loadFixture(deployMocks);

        await expect(
            signer1.sendTransaction({ to: ethReceiverMock, value: 100 }),
        ).to.be.revertedWithCustomError(ethReceiverMock, 'EthDepositRejected');
    });
});
