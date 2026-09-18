import { getNetworkConnection } from '../../src/network.js';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import { expect } from '../../src/expect.js';
import { ether } from '../../src/prelude.js';
import { SelfdestructEthSenderMock } from '../../typechain-types/index.js';

const { ethers, networkHelpers } = await getNetworkConnection();


describe('SelfdestructEthSender', function () {
    let signer0: HardhatEthersSigner;
    let signer1: HardhatEthersSigner;

    before(async function () {
        [signer0, signer1] = await ethers.getSigners();
    });

    async function deployMocks() {
        const EthSender = await ethers.getContractFactory('SelfdestructEthSenderMock');
        const ethSender: SelfdestructEthSenderMock = await EthSender.deploy();

        return { ethSender };
    }

    it('should send Ethers with selfdestruct', async function () {
        const { ethSender } = await networkHelpers.loadFixture(deployMocks);
        const ethSenderAddress = await ethSender.getAddress();

        await signer0.sendTransaction({ to: ethSenderAddress, value: ether('1') });
        const receipt0 = await (await ethSender.transferBalance(signer1.address)).wait();
        console.log('send ethers without selfdestruct', receipt0!.gasUsed.toString());

        await signer0.sendTransaction({ to: ethSenderAddress, value: ether('1') });
        const balanceOfAddr1 = await ethers.provider.getBalance(signer1.address);
        const receipt1 = await (await ethSender.stopAndTransferBalance(signer1.address)).wait();
        console.log('send all ethers', receipt1!.gasUsed.toString());
        expect(await ethers.provider.getBalance(signer1.address)).to.be.eq(balanceOfAddr1 + ether('1'));
        expect(await ethers.provider.getBalance(ethSenderAddress)).to.be.eq(ether('0'));
        expect(await ethers.provider.getCode(ethSenderAddress)).to.be.not.eq('0x');
    });
});
