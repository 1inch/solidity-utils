import { constants } from '../../src/prelude';
import { expect } from '../../src/expect';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('AddressArray', function () {
    let signer1: SignerWithAddress;
    let signer2: SignerWithAddress;
    let signer3: SignerWithAddress;

    before(async function () {
        [signer1, signer2, signer3] = await ethers.getSigners();
    });

    async function deployAddressArrayMock() {
        const AddressArrayMock = await ethers.getContractFactory('AddressArrayMock');
        const addressArrayMock = await AddressArrayMock.deploy();
        return { addressArrayMock };
    }

    describe('length', function () {
        it('should calculate length 0', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await signer1.sendTransaction(await addressArrayMock.length.populateTransaction());
            expect(await addressArrayMock.length()).to.be.equal('0');
        });

        it('should calculate length 1', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await signer1.sendTransaction(await addressArrayMock.length.populateTransaction());
            expect(await addressArrayMock.length()).to.be.equal('1');
        });
    });

    describe('at', function () {
        it('should not get from empty array', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await expect(addressArrayMock.at(0)).to.be.revertedWithCustomError(addressArrayMock, 'IndexOutOfBounds');
        });

        it('should not get index out of array length', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await expect(addressArrayMock.at(await addressArrayMock.length())).to.be.revertedWithCustomError(addressArrayMock, 'IndexOutOfBounds');
        });

        it('should get from array with 1 element', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            expect(await addressArrayMock.at(0)).to.be.equal(signer1.address);
            await expect(addressArrayMock.at(1)).to.be.revertedWithCustomError(addressArrayMock, 'IndexOutOfBounds');
        });

        it('should get from array with several elements', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await addressArrayMock.push(signer2);
            expect(await addressArrayMock.at(0)).to.be.equal(signer1.address);
            expect(await addressArrayMock.at(1)).to.be.equal(signer2.address);
        });
    });

    describe('unsafeAt', function () {
        it('should get from empty array', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            expect(await addressArrayMock.unsafeAt(0)).to.be.equal(constants.ZERO_ADDRESS);
            expect(await addressArrayMock.unsafeAt(1)).to.be.equal(constants.ZERO_ADDRESS);
        });

        it('should get from array with 1 element', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            expect(await addressArrayMock.unsafeAt(0)).to.be.equal(signer1.address);
            expect(await addressArrayMock.unsafeAt(1)).to.be.equal(constants.ZERO_ADDRESS);
        });

        it('should get from array with several elements', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await addressArrayMock.push(signer2);
            expect(await addressArrayMock.unsafeAt(0)).to.be.equal(signer1.address);
            expect(await addressArrayMock.unsafeAt(1)).to.be.equal(signer2.address);
        });
    });

    describe('get', function () {
        it('should get empty array', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await signer1.sendTransaction(await addressArrayMock.get.populateTransaction());
            expect(await addressArrayMock.get()).to.be.deep.equal([]);
        });

        it('should get array with 1 element', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await signer1.sendTransaction(await addressArrayMock.get.populateTransaction());
            expect(await addressArrayMock.get()).to.be.deep.equal([signer1.address]);
        });

        it('should get array with 2 elements', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await addressArrayMock.push(signer2);
            await signer1.sendTransaction(await addressArrayMock.get.populateTransaction());
            expect(await addressArrayMock.get()).to.be.deep.equal([signer1.address, signer2.address]);
        });

        it('should get from array with 3 elements', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await addressArrayMock.push(signer2);
            await addressArrayMock.push(signer3);
            await signer1.sendTransaction(await addressArrayMock.get.populateTransaction());
            expect(await addressArrayMock.get()).to.be.deep.equal([signer1.address, signer2.address, signer3.address]);
        });
    });

    describe('push', function () {
        it('should push to empty array', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            const pushedIndex = await addressArrayMock.push.staticCall(signer1);
            await addressArrayMock.push(signer1);
            expect(await addressArrayMock.at(pushedIndex - 1n)).to.be.equal(signer1.address);
        });

        it('should push to array with 1 element', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            const pushedIndex = await addressArrayMock.push.staticCall(signer2);
            await addressArrayMock.push(signer2);
            expect(await addressArrayMock.at(pushedIndex - 1n)).to.be.equal(signer2.address);
        });

        it('should push to array with 2 elements', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await addressArrayMock.push(signer2);
            const pushedIndex = await addressArrayMock.push.staticCall(signer3);
            await addressArrayMock.push(signer3);
            expect(await addressArrayMock.at(pushedIndex - 1n)).to.be.equal(signer3.address);
        });
    });

    describe('pop', function () {
        it('should throw when array is empty', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await expect(addressArrayMock.pop()).to.be.revertedWithCustomError(addressArrayMock, 'PopFromEmptyArray');
        });

        it('should pop from array with 1 element', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await addressArrayMock.pop();
            await signer1.sendTransaction(await addressArrayMock.get.populateTransaction());
            expect(await addressArrayMock.get()).to.be.deep.equal([]);
        });

        it('should pop from array with 2 elements', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await addressArrayMock.push(signer2);
            await addressArrayMock.pop();
            await signer1.sendTransaction(await addressArrayMock.get.populateTransaction());
            expect(await addressArrayMock.get()).to.be.deep.equal([signer1.address]);
        });

        it('should pop from array with 3 elements', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await addressArrayMock.push(signer2);
            await addressArrayMock.push(signer3);
            await addressArrayMock.pop();
            await signer1.sendTransaction(await addressArrayMock.get.populateTransaction());
            expect(await addressArrayMock.get()).to.be.deep.equal([signer1.address, signer2.address]);
        });

        it('should throw when pops more than there are elements in array', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await addressArrayMock.pop();
            await expect(addressArrayMock.pop()).to.be.revertedWithCustomError(addressArrayMock, 'PopFromEmptyArray');
        });
    });

    describe('set', function () {
        it('should throw when sets index out of bounds', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await expect(addressArrayMock.set(0, signer1)).to.be.revertedWithCustomError(
                addressArrayMock,
                'IndexOutOfBounds',
            );
        });

        it('should set index 0 in array with 1 element', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await addressArrayMock.set(0, signer2);
            await signer1.sendTransaction(await addressArrayMock.get.populateTransaction());
            expect(await addressArrayMock.get()).to.be.deep.equal([signer2.address]);
        });

        it('should set index 0 in array with several elements', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await addressArrayMock.push(signer2);
            await addressArrayMock.set(0, signer3);
            await signer1.sendTransaction(await addressArrayMock.get.populateTransaction());
            expect(await addressArrayMock.get()).to.be.deep.equal([signer3.address, signer2.address]);
        });

        it('should set index 1 in array with several elements', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await addressArrayMock.push(signer2);
            await addressArrayMock.set(1, signer3);
            await signer1.sendTransaction(await addressArrayMock.get.populateTransaction());
            expect(await addressArrayMock.get()).to.be.deep.equal([signer1.address, signer3.address]);
        });
    });

    describe('multiple add/remove', function () {
        it('should add and remove multiple times', async function () {
            const { addressArrayMock } = await loadFixture(deployAddressArrayMock);
            await addressArrayMock.push(signer1);
            await addressArrayMock.push(signer2);
            await addressArrayMock.pop();
            await addressArrayMock.pop();
            await addressArrayMock.push(signer1);
            await addressArrayMock.push(signer2);
            await addressArrayMock.pop();
            await addressArrayMock.pop();
        });
    });
});
