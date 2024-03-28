import { expect } from '../../src/expect';
import { ether } from '../../src/prelude';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('CheapEthSender', function () {
    let signer0: SignerWithAddress;
    let signer1: SignerWithAddress;

    before(async function () {
        [signer0, signer1] = await ethers.getSigners();
    });

    async function deployMocks() {
        const CheapEthSender = await ethers.getContractFactory('CheapEthSenderMock');
        const cheapEthSender = await CheapEthSender.deploy();

        return { cheapEthSender };
    }

    it('should send Ethers with selfdestruct', async function () {
        const { cheapEthSender } = await loadFixture(deployMocks);
        const cheapEthSenderAddress = await cheapEthSender.getAddress();

        await signer0.sendTransaction({ to: cheapEthSenderAddress, value: ether('1') });
        const receipt0 = await (await cheapEthSender.sendEthers(signer1.address)).wait();
        console.log('send ethers without selfdestruct', receipt0!.gasUsed.toString());

        await signer0.sendTransaction({ to: cheapEthSenderAddress, value: ether('1') });
        const balanceOfAddr1 = await ethers.provider.getBalance(signer1.address);
        const receipt1 = await (await cheapEthSender.sendAllEthers(signer1.address)).wait();
        console.log('send all ethers', receipt1!.gasUsed.toString());
        expect(await ethers.provider.getBalance(signer1.address)).to.be.eq(balanceOfAddr1 + ether('1'));
        expect(await ethers.provider.getBalance(cheapEthSenderAddress)).to.be.eq(ether('0'));
        expect(await cheapEthSender.alive()).to.be.eq(1n);
    });
});
