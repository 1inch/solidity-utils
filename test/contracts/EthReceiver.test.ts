import { expect } from '../../src/prelude';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('EthReceiver', async function () {
    let signer1: SignerWithAddress;

    before(async function () {
        [signer1] = await ethers.getSigners();
    });

    const deployMocks = async () => {
        const EthReceiverMock = await ethers.getContractFactory('EthReceiverMock');
        const ethReceiverMock = await EthReceiverMock.deploy();

        const EthSenderMock = await ethers.getContractFactory('EthSenderMock');
        const ethSenderMock = await EthSenderMock.deploy();
        return { ethReceiverMock, ethSenderMock };
    };

    it('contract transfer', async function () {
        const { ethReceiverMock, ethSenderMock } = await loadFixture(deployMocks);
        await ethSenderMock.transfer(ethReceiverMock.address, { value: 100 });
    });

    it('normal transfer', async function () {
        const { ethReceiverMock } = await loadFixture(deployMocks);

        await expect(
            signer1.sendTransaction({ to: ethReceiverMock.address, value: 100 }),
        ).to.be.revertedWithCustomError(ethReceiverMock, 'EthDepositRejected');
    });
});
