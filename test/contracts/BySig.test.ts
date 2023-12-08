import { expect } from '../../src/prelude';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { buildBySigTraits } from './BySigTrairs.test';

function hashBySig(name: string, version: string, chainId: bigint, verifyingContract: string, sig: SignedCallStruct): string {
    const domain = { name, version, chainId, verifyingContract };
    const types = {
        SignedCall: [
            { name: 'traits', type: 'uint256' },
            { name: 'data', type: 'bytes' },
        ],
    };
    return ethers.TypedDataEncoder.hash(domain, types, sig);
}

describe('BySig', function () {
    async function deployAddressArrayMock() {
        const [account] = await ethers.getSigners();
        const eip712Version = '1';
        const TokenWithBySig = await ethers.getContractFactory('TokenWithBySig');
        const token = await TokenWithBySig.deploy('Token', 'TKN', eip712Version);
        return { account, token, eip712Version };
    }

    describe('bySigAccountNonces and useBySigAccountNonce', function () {
        it('should return current nonce and correct change it', async function () {
            const { account, token } = await loadFixture(deployAddressArrayMock);
            expect(await token.bySigAccountNonces(account)).to.be.equal(0);
            await token.useBySigAccountNonce(10);
            expect(await token.bySigAccountNonces(account)).to.be.equal(10);
            await token.useBySigAccountNonce(5);
            expect(await token.bySigAccountNonces(account)).to.be.equal(15);
        });
    });

    describe('bySigSelectorNonces and useBySigSelectorNonce', function () {
        it('should return current nonce and correct change it', async function () {
            const { account, token } = await loadFixture(deployAddressArrayMock);
            const selector = token.interface.getFunction('transfer').selector;
            expect(await token.bySigSelectorNonces(account, selector)).to.be.equal(0);
            await token.useBySigSelectorNonce(selector, 20);
            expect(await token.bySigSelectorNonces(account, selector)).to.be.equal(20);
            await token.useBySigSelectorNonce(selector, 6);
            expect(await token.bySigSelectorNonces(account, selector)).to.be.equal(26);
        });
    });

    describe('bySigUniqueNonces and useBySigUniqueNonce and bySigUniqueNoncesSlot', function () {
        it('should return true if nonce equals to setted nonce, false in another case and correct change it', async function () {
            const { account, token } = await loadFixture(deployAddressArrayMock);
            expect(await token.bySigUniqueNoncesSlot(account, 0)).to.be.equal(0);
            expect(await token.bySigUniqueNonces(account, 0)).to.be.equal(false);

            await token.useBySigUniqueNonce(1);
            expect(await token.bySigUniqueNoncesSlot(account, 0)).to.be.equal(2);
            expect(await token.bySigUniqueNonces(account, 1)).to.be.equal(true);
            expect(await token.bySigUniqueNonces(account, 2)).to.be.equal(false);
            expect(await token.bySigUniqueNonces(account, 3)).to.be.equal(false);

            await token.useBySigUniqueNonce(3);
            expect(await token.bySigUniqueNoncesSlot(account, 0)).to.be.equal(10);
            expect(await token.bySigUniqueNonces(account, 1)).to.be.equal(true);
            expect(await token.bySigUniqueNonces(account, 2)).to.be.equal(false);
            expect(await token.bySigUniqueNonces(account, 3)).to.be.equal(true);

            await token.useBySigUniqueNonce(2);
            expect(await token.bySigUniqueNoncesSlot(account, 0)).to.be.equal(14);
            expect(await token.bySigUniqueNonces(account, 1)).to.be.equal(true);
            expect(await token.bySigUniqueNonces(account, 2)).to.be.equal(true);
            expect(await token.bySigUniqueNonces(account, 3)).to.be.equal(true);
        });
    });

    describe('hashBySig', function () {
        it('should return correct hash', async function () {
            const { token, eip712Version } = await loadFixture(deployAddressArrayMock);
            const sig = {
                traits: buildBySigTraits(),
                data: '0x',
            } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
            expect(await token.hashBySig(sig)).to.be.equal(hashBySig(await token.name(), eip712Version, await token.getChainId(), await token.getAddress(), sig));
        });
    });

    describe('bySig', function () {
        it('main tests', async function () {
            // const { token, eip712Version } = await loadFixture(deployAddressArrayMock);
            // TODO: add tests
        });
    });

});
