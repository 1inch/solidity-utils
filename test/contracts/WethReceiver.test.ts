import { expect } from '../../src/expect';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('WethReceiver', function () {
    let signer1: SignerWithAddress;

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
        const { wethReceiverMock, ethSenderMock } = await loadFixture(deployMocks);
        await ethSenderMock.transfer(wethReceiverMock, { value: 100 });
    });

    it('normal transfer', async function () {
        const { wethReceiverMock } = await loadFixture(deployMocks);
        await expect(
            signer1.sendTransaction({ to: wethReceiverMock, value: 100 }),
        ).to.be.revertedWithCustomError(wethReceiverMock, 'EthDepositRejected');
    });
});
