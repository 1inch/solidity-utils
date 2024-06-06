import { constants } from '../../src/prelude';
import { expect } from '../../src/expect';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { NonceType, buildBySigTraits, hashBySig, signSignedCall } from '../../src/bySig';

describe('BySig', function () {
    async function deployAddressArrayMock() {
        const [alice, bob, carol] = await ethers.getSigners();
        const version = '1';
        const name = 'Token';
        const TokenWithBySig = await ethers.getContractFactory('TokenWithBySig');
        const token = await TokenWithBySig.deploy(name, 'TKN', version);

        await token.mint(bob.address, 1000);

        return { addrs: { alice, bob, carol }, token, eip712: { name, version } };
    }

    describe('bySigAccountNonces and useBySigAccountNonce', function () {
        it('should return current nonce and correct change it', async function () {
            const { addrs: { alice }, token } = await loadFixture(deployAddressArrayMock);
            expect(await token.bySigAccountNonces(alice)).to.be.equal(0);
            await token.useBySigAccountNonce(10);
            expect(await token.bySigAccountNonces(alice)).to.be.equal(10);
            await token.useBySigAccountNonce(5);
            expect(await token.bySigAccountNonces(alice)).to.be.equal(15);
        });
    });

    describe('bySigSelectorNonces and useBySigSelectorNonce', function () {
        it('should return current nonce and correct change it', async function () {
            const { addrs: { alice }, token } = await loadFixture(deployAddressArrayMock);
            const selector = token.interface.getFunction('transfer').selector;
            expect(await token.bySigSelectorNonces(alice, selector)).to.be.equal(0);
            await token.useBySigSelectorNonce(selector, 20);
            expect(await token.bySigSelectorNonces(alice, selector)).to.be.equal(20);
            await token.useBySigSelectorNonce(selector, 6);
            expect(await token.bySigSelectorNonces(alice, selector)).to.be.equal(26);
        });
    });

    describe('bySigUniqueNonces and useBySigUniqueNonce and bySigUniqueNoncesSlot', function () {
        it('should return true if nonce equals to setted nonce, false in another case and correct change it', async function () {
            const { addrs: { alice }, token } = await loadFixture(deployAddressArrayMock);
            expect(await token.bySigUniqueNoncesSlot(alice, 0)).to.be.equal(0);
            expect(await token.bySigUniqueNonces(alice, 0)).to.be.equal(false);

            await token.useBySigUniqueNonce(1);
            expect(await token.bySigUniqueNoncesSlot(alice, 0)).to.be.equal(2);
            expect(await token.bySigUniqueNonces(alice, 1)).to.be.equal(true);
            expect(await token.bySigUniqueNonces(alice, 2)).to.be.equal(false);
            expect(await token.bySigUniqueNonces(alice, 3)).to.be.equal(false);

            await token.useBySigUniqueNonce(3);
            expect(await token.bySigUniqueNoncesSlot(alice, 0)).to.be.equal(10);
            expect(await token.bySigUniqueNonces(alice, 1)).to.be.equal(true);
            expect(await token.bySigUniqueNonces(alice, 2)).to.be.equal(false);
            expect(await token.bySigUniqueNonces(alice, 3)).to.be.equal(true);

            await token.useBySigUniqueNonce(2);
            expect(await token.bySigUniqueNoncesSlot(alice, 0)).to.be.equal(14);
            expect(await token.bySigUniqueNonces(alice, 1)).to.be.equal(true);
            expect(await token.bySigUniqueNonces(alice, 2)).to.be.equal(true);
            expect(await token.bySigUniqueNonces(alice, 3)).to.be.equal(true);
        });
    });

    describe('hashBySig', function () {
        it('should return correct hash', async function () {
            const { token, eip712: { name, version } } = await loadFixture(deployAddressArrayMock);
            const sig = {
                traits: buildBySigTraits(),
                data: '0x',
            };
            expect(await token.hashBySig(sig)).to.be.equal(hashBySig(name, version, await token.getChainId(), await token.getAddress(), sig));
        });
    });

    describe('bySig', function () {
        it('should revert after traits deadline', async function () {
            const { addrs: { alice }, token } = await loadFixture(deployAddressArrayMock);
            const sig = {
                traits: buildBySigTraits({ deadline: (await ethers.provider.getBlock('latest'))!.timestamp }),
                data: '0x',
            };
            await expect(token.bySig(alice, sig, '0x')).to.be.revertedWithCustomError(token, 'DeadlineExceeded');
        });

        it('should revert if relayer denied', async function () {
            const { addrs: { alice }, token } = await loadFixture(deployAddressArrayMock);
            const sig = {
                traits: buildBySigTraits({ deadline: 0xffffffffff, relayer: constants.EEE_ADDRESS }),
                data: '0x',
            };
            await expect(token.bySig(alice, sig, '0x')).to.be.revertedWithCustomError(token, 'WrongRelayer');
        });

        it('should revert with wrong Account nonce', async function () {
            const { addrs: { alice }, token } = await loadFixture(deployAddressArrayMock);
            await token.useBySigAccountNonce(100);
            const sig = {
                traits: buildBySigTraits({ deadline: 0xffffffffff, nonceType: NonceType.Account, nonce: 99 }),
                data: '0x',
            };
            await expect(token.bySig(alice, sig, '0x')).to.be.revertedWithCustomError(token, 'WrongNonce');
        });

        it('should revert with wrong Selector nonce', async function () {
            const { addrs: { alice }, token } = await loadFixture(deployAddressArrayMock);
            const selector = token.interface.getFunction('transfer').selector;
            await token.useBySigSelectorNonce(selector, 100);
            const sig = {
                traits: buildBySigTraits({ deadline: 0xffffffffff, nonceType: NonceType.Selector, nonce: 99 }),
                data: '0x',
            };
            await expect(token.bySig(alice, sig, '0x')).to.be.revertedWithCustomError(token, 'WrongNonce');
        });

        it('should revert with wrong Unique nonce', async function () {
            const { addrs: { alice }, token } = await loadFixture(deployAddressArrayMock);
            await token.useBySigUniqueNonce(100);
            const sig = {
                traits: buildBySigTraits({ deadline: 0xffffffffff, nonceType: NonceType.Unique, nonce: 100 }),
                data: '0x',
            };
            await expect(token.bySig(alice, sig, '0x')).to.be.revertedWithCustomError(token, 'WrongNonce');
        });

        it('should revert with wrong signature when no data', async function () {
            const { addrs: { alice }, token } = await loadFixture(deployAddressArrayMock);
            const sig = {
                traits: buildBySigTraits({ deadline: 0xffffffffff, nonceType: NonceType.Unique, nonce: 0 }),
                data: '0x',
            };
            await expect(token.bySig(alice, sig, '0x')).to.be.revertedWithCustomError(token, 'WrongSignature');
        });

        it('should revert with wrong signature', async function () {
            const { addrs: { alice, bob }, token, eip712: { name, version } } = await loadFixture(deployAddressArrayMock);
            const signedCall = {
                traits: buildBySigTraits({ deadline: 0xffffffffff, nonceType: NonceType.Selector, nonce: 0 }),
                data: token.interface.encodeFunctionData('transfer', [alice.address, 100]),
            };
            const signature = await signSignedCall(name, version, await token.getChainId(), await token.getAddress(), alice, signedCall);
            await expect(token.bySig(bob, signedCall, signature)).to.be.revertedWithCustomError(token, 'WrongSignature');
        });

        it('should work for transfer method', async function () {
            const { addrs: { alice, bob }, token, eip712: { name, version } } = await loadFixture(deployAddressArrayMock);
            const signedCall = {
                traits: buildBySigTraits({ deadline: 0xffffffffff, nonceType: NonceType.Selector, nonce: 0 }),
                data: token.interface.encodeFunctionData('transfer', [alice.address, 100]),
            };
            const signature = await signSignedCall(name, version, await token.getChainId(), await token.getAddress(), bob, signedCall);
            await expect(token.bySig(bob, signedCall, signature))
                .to.emit(token, 'Transfer')
                .withArgs(bob.address, alice.address, 100);
            expect(await token.balanceOf(bob)).to.be.equal(900);
            expect(await token.balanceOf(alice)).to.be.equal(100);
        });

        it('should make approve for sponsored call', async function () {
            const { addrs: { alice, bob }, token, eip712: { name, version } } = await loadFixture(deployAddressArrayMock);
            const approveData = token.interface.encodeFunctionData('approve', [alice.address, 100]);
            const signedCall = {
                traits: buildBySigTraits({ deadline: 0xffffffffff, nonceType: NonceType.Selector, nonce: 0 }),
                data: token.interface.encodeFunctionData('sponsoredCall', [await token.getAddress(), '0', approveData, '0x']),
            };
            const signature = await signSignedCall(name, version, await token.getChainId(), await token.getAddress(), bob, signedCall);
            expect(await token.allowance(bob.address, alice.address)).to.be.equal(0);
            await expect(token.bySig(bob, signedCall, signature))
                .to.emit(token, 'ChargedSigner')
                .withArgs(bob.address, alice.address, token.target, '0');
            expect(await token.allowance(bob.address, alice.address)).to.be.equal(100);
        });

        it('should work recursively', async function () {
            const { addrs: { alice, bob, carol }, token, eip712: { name, version } } = await loadFixture(deployAddressArrayMock);

            // Bob sign for Carol
            const bobSignedCall = {
                traits: buildBySigTraits({ relayer: carol.address, deadline: 0xffffffffff, nonceType: NonceType.Selector, nonce: 0 }),
                data: token.interface.encodeFunctionData('transfer', [carol.address, 100]),
            };
            const bobSignature = await signSignedCall(name, version, await token.getChainId(), await token.getAddress(), bob, bobSignedCall);

            // Carol sign for Alice
            const carolSignedCall = {
                traits: buildBySigTraits({ relayer: alice.address, deadline: 0xffffffffff, nonceType: NonceType.Selector, nonce: 0 }),
                data: token.interface.encodeFunctionData('bySig', [bob.address, bobSignedCall, bobSignature]),
            };
            const carolSignature = await signSignedCall(name, version, await token.getChainId(), await token.getAddress(), carol, carolSignedCall);

            await expect(token.bySig(carol, carolSignedCall, carolSignature))
                .to.emit(token, 'Transfer')
                .withArgs(bob.address, carol.address, 100);
            expect(await token.balanceOf(bob)).to.be.equal(900);
            expect(await token.balanceOf(carol)).to.be.equal(100);
        });

        it('should work recursively for sponsored call', async function () {
            const { addrs: { alice, bob, carol }, token, eip712: { name, version } } = await loadFixture(deployAddressArrayMock);

            // Bob sign for Carol
            const approveData = token.interface.encodeFunctionData('approve', [carol.address, 100]);
            const bobSignedCall = {
                traits: buildBySigTraits({ relayer: carol.address, deadline: 0xffffffffff, nonceType: NonceType.Selector, nonce: 0 }),
                data: token.interface.encodeFunctionData('sponsoredCall', [await token.getAddress(), '0', approveData, '0x']),
            };
            const bobSignature = await signSignedCall(name, version, await token.getChainId(), await token.getAddress(), bob, bobSignedCall);

            // Carol sign for Alice
            const carolSigByData = token.interface.encodeFunctionData('bySig', [bob.address, bobSignedCall, bobSignature]);
            const carolSignedCall = {
                traits: buildBySigTraits({ relayer: alice.address, deadline: 0xffffffffff, nonceType: NonceType.Selector, nonce: 0 }),
                data: token.interface.encodeFunctionData('sponsoredCall', [await token.getAddress(), '0', carolSigByData, '0x']),
            };
            const carolSignature = await signSignedCall(name, version, await token.getChainId(), await token.getAddress(), carol, carolSignedCall);

            expect(await token.allowance(bob.address, carol.address)).to.be.equal(0);
            await expect(token.bySig(carol, carolSignedCall, carolSignature))
                .to.emit(token, 'ChargedSigner')
                .withArgs(bob.address, alice.address, token.target, '0');
            expect(await token.allowance(bob.address, carol.address)).to.be.equal(100);
        });
    });
});
