import { expect } from '../../src/prelude';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('BySig', function () {
    async function deployAddressArrayMock() {
        const [account] = await ethers.getSigners();
        const TokenWithBySig = await ethers.getContractFactory('TokenWithBySig');
        const token = await TokenWithBySig.deploy('Token', 'TKN', '1');
        return { account, token };
    }

    describe('bySigAccountNonces and useBySigAccountNonce', function () {
        it('should return current nonce and correct change it', async function () {
            const { account, token } = await loadFixture(deployAddressArrayMock);
            expect(await token.bySigAccountNonces(account)).to.be.equal(0);
            token.useBySigAccountNonce(10);
            expect(await token.bySigAccountNonces(account)).to.be.equal(10);
        });

    });
});
