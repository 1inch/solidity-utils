import { expect, constants } from '../../src/prelude';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('AddressSet', async function () {
    let signer1: SignerWithAddress;
    let signer2: SignerWithAddress;
    let signer3: SignerWithAddress;

    before(async function () {
        [signer1, signer2, signer3] = await ethers.getSigners();
    });

    async function deployAddressSetMock() {
        const AddressSetMock = await ethers.getContractFactory('AddressSetMock');
        const addressSetMock = await AddressSetMock.deploy();
        return { addressSetMock };
    }

    describe('length', async function () {
        it('should get length 0', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            expect(await addressSetMock.length()).to.be.equal('0');
        });

        it('should get length 1', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            await addressSetMock.add(signer1.address);
            expect(await addressSetMock.length()).to.be.equal('1');
        });
    });

    describe('at', async function () {
        it('should get from empty set', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            expect(await addressSetMock.at(0)).to.be.equal(constants.ZERO_ADDRESS);
            expect(await addressSetMock.at(1)).to.be.equal(constants.ZERO_ADDRESS);
        });

        it('should get from set with 1 element', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            await addressSetMock.add(signer1.address);
            expect(await addressSetMock.at(0)).to.be.equal(signer1.address);
            expect(await addressSetMock.at(1)).to.be.equal(constants.ZERO_ADDRESS);
        });

        it('should get from set with several elements', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            await addressSetMock.add(signer1.address);
            await addressSetMock.add(signer2.address);
            expect(await addressSetMock.at(0)).to.be.equal(signer1.address);
            expect(await addressSetMock.at(1)).to.be.equal(signer2.address);
        });
    });

    describe('contains', async function () {
        it('should not contain in empty set', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            expect(await addressSetMock.contains(signer1.address)).to.be.equal(false);
            expect(await addressSetMock.contains(signer2.address)).to.be.equal(false);
            expect(await addressSetMock.contains(constants.ZERO_ADDRESS)).to.be.equal(false);
        });

        it('should contain 1 address', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            await addressSetMock.add(signer1.address);
            expect(await addressSetMock.contains(signer1.address)).to.be.equal(true);
            expect(await addressSetMock.contains(signer2.address)).to.be.equal(false);
            expect(await addressSetMock.contains(constants.ZERO_ADDRESS)).to.be.equal(false);
        });

        it('should contains several addresses', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            await addressSetMock.add(signer1.address);
            await addressSetMock.add(signer2.address);
            expect(await addressSetMock.contains(signer1.address)).to.be.equal(true);
            expect(await addressSetMock.contains(signer2.address)).to.be.equal(true);
            expect(await addressSetMock.contains(signer3.address)).to.be.equal(false);
            expect(await addressSetMock.contains(constants.ZERO_ADDRESS)).to.be.equal(false);
        });
    });

    describe('add', async function () {
        it('should add to empty set', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            const isAdded = await addressSetMock.callStatic.add(signer1.address);
            await addressSetMock.add(signer1.address);
            expect(await addressSetMock.contains(signer1.address)).to.be.equal(isAdded);
        });

        it('should not add element twice', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            await addressSetMock.add(signer1.address);
            expect(await addressSetMock.callStatic.add(signer1.address)).to.be.equal(false);
        });

        it('should add to set with 1 element', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            await addressSetMock.add(signer1.address);
            const isAdded = await addressSetMock.callStatic.add(signer2.address);
            await addressSetMock.add(signer2.address);
            expect(await addressSetMock.contains(signer2.address)).to.be.equal(isAdded);
        });

        it('should not add element twice to set with 1 element', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            await addressSetMock.add(signer1.address);
            await addressSetMock.add(signer2.address);
            expect(await addressSetMock.callStatic.add(signer2.address)).to.be.equal(false);
        });
    });

    describe('remove', async function () {
        it('should not remove from empty set', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            const isRemoved = await addressSetMock.callStatic.remove(signer1.address);
            expect(isRemoved).to.be.equal(false);
        });

        it('should remove from set', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            await addressSetMock.add(signer1.address);
            const isRemoved = await addressSetMock.callStatic.remove(signer1.address);
            await addressSetMock.remove(signer1.address);
            expect(isRemoved).to.be.equal(true);
            expect(await addressSetMock.contains(signer1.address)).to.be.equal(false);
        });

        it('should not remove element which is not in set', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            await addressSetMock.add(signer1.address);
            const isRemoved = await addressSetMock.callStatic.remove(signer2.address);
            expect(isRemoved).to.be.equal(false);
        });

        it('should remove from set and keep other elements', async function () {
            const { addressSetMock } = await loadFixture(deployAddressSetMock);
            await addressSetMock.add(signer1.address);
            await addressSetMock.add(signer2.address);
            const isRemoved = await addressSetMock.callStatic.remove(signer1.address);
            await addressSetMock.remove(signer1.address);
            expect(isRemoved).to.be.equal(true);
            expect(await addressSetMock.contains(signer1.address)).to.be.equal(false);
            expect(await addressSetMock.contains(signer2.address)).to.be.equal(true);
        });
    });
});
