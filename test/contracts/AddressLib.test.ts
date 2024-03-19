import { expect } from '../../src/expect';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('AddressLib', function () {
    let signer: SignerWithAddress;

    before(async function () {
        [signer] = await ethers.getSigners();
    });

    async function deployAddressLibMock() {
        const AddressLibMock = await ethers.getContractFactory('AddressLibMock');
        const addressLibMock = await AddressLibMock.deploy();
        const flags = [1n << 160n, 1n << 192n, 1n << 255n];
        return { addressLibMock, flags };
    }

    describe('get', function () {
        it('should return correct address not depending on flags', async function () {
            const { addressLibMock, flags } = await loadFixture(deployAddressLibMock);
            expect(await addressLibMock.get(signer.address)).to.be.equal(signer.address);
            for (const flag of flags) {
                expect(await addressLibMock.get(BigInt(signer.address) | flag)).to.be.equal(signer.address);
            }
        });
    });

    describe('getFlag', function () {
        it('should return true when flag in Address', async function () {
            const { addressLibMock, flags } = await loadFixture(deployAddressLibMock);
            for (const flag of flags) {
                expect(await addressLibMock.getFlag(BigInt(signer.address) | flag, flag)).to.be.true;
                expect(await addressLibMock.getFlag(BigInt(signer.address) | flag, 1n << 161n)).to.be.false;
            }
        });
    });

    describe('getUint32', function () {
        it('should return uint32 from Address with offset', async function () {
            const { addressLibMock } = await loadFixture(deployAddressLibMock);
            const flag = (1n << 160n) + (1n << 193n);
            expect(await addressLibMock.getUint32(BigInt(signer.address) | flag, 160)).to.be.equal(1);
            expect(await addressLibMock.getUint32(BigInt(signer.address) | flag, 193)).to.be.equal(1);
        });
    });

    describe('getUint64', function () {
        it('should return uint64 from Address with offset', async function () {
            const { addressLibMock } = await loadFixture(deployAddressLibMock);
            const flag = (1n << 160n) + (1n << 225n);
            expect(await addressLibMock.getUint64(BigInt(signer.address) | flag, 160)).to.be.equal(1);
            expect(await addressLibMock.getUint64(BigInt(signer.address) | flag, 225)).to.be.equal(1);
        });
    });
});
