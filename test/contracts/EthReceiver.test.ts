import { expect } from '../../src/expect';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('EthReceiver', function () {
    let signer1: SignerWithAddress;

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
        const { ethReceiverMock, ethSenderMock } = await loadFixture(deployMocks);
        await ethSenderMock.transfer(ethReceiverMock, { value: 100 });
    });

    it('normal transfer', async function () {
        const { ethReceiverMock } = await loadFixture(deployMocks);

        await expect(
            signer1.sendTransaction({ to: ethReceiverMock, value: 100 }),
        ).to.be.revertedWithCustomError(ethReceiverMock, 'EthDepositRejected');
    });
});
