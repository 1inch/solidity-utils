import { expect, constants } from '../../src/prelude';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

export const NonceType = {
    Account: 0,
    Selector: 1,
    Unique: 2,
};

export function buildBySigTraits({
    nonceType = 0,
    deadline = 0,
    relayer = constants.ZERO_ADDRESS.toString(),
    nonce = 0,
} = {}) {
    if (nonceType > 3) {
        throw new Error('Wrong nonce type, it should be less than 4');
    }
    if (deadline > 0xffffffffff) {
        throw new Error('Wrong deadline, it should be less than 0xffffffff');
    }
    if (relayer.length > 42) {
        throw new Error('Wrong relayer address, it should be less than 42 symbols');
    }
    if (nonce > 0xffffffffffffffffffffffffffffffffn) {
        throw new Error('Wrong nonce, it should not be more than 128 bits');
    }

    return (BigInt(nonceType) << 254n) +
            (BigInt(deadline) << 208n) +
            ((BigInt(relayer) & 0xffffffffffffffffffffn) << 128n) +
            BigInt(nonce);
}

describe('BySigTraits', function () {
    async function deployAddressArrayMock() {
        const BySigTraits = await ethers.getContractFactory('BySigTraitsMock');
        const bySigTraitsMock = await BySigTraits.deploy();
        return { bySigTraitsMock };
    }

    describe('nonceType', function () {
        it('should return nonce type for Account', async function () {
            const { bySigTraitsMock } = await loadFixture(deployAddressArrayMock);
            const value = buildBySigTraits({ nonceType: NonceType.Account });
            expect(await bySigTraitsMock.nonceType(value)).to.be.equal(NonceType.Account);
        });

        it('should return nonce type for Selector', async function () {
            const { bySigTraitsMock } = await loadFixture(deployAddressArrayMock);
            const value = buildBySigTraits({ nonceType: NonceType.Selector });
            expect(await bySigTraitsMock.nonceType(value)).to.be.equal(NonceType.Selector);
        });

        it('should return nonce type for Selector', async function () {
            const { bySigTraitsMock } = await loadFixture(deployAddressArrayMock);
            const value = buildBySigTraits({ nonceType: NonceType.Unique });
            expect(await bySigTraitsMock.nonceType(value)).to.be.equal(NonceType.Unique);
        });

        it('should revert with unsupported nonce', async function () {
            const { bySigTraitsMock } = await loadFixture(deployAddressArrayMock);
            const value = buildBySigTraits({ nonceType: 3 });
            await expect(bySigTraitsMock.nonceType(value)).to.be.revertedWithCustomError(bySigTraitsMock, 'WrongNonceType');
        });
    });

    describe('deadline', function () {
        it('should return correct deadline', async function () {
            const { bySigTraitsMock } = await loadFixture(deployAddressArrayMock);
            const value1 = buildBySigTraits({ deadline: 1 });
            expect(await bySigTraitsMock.deadline(value1)).to.be.equal(1);
            const value2 = buildBySigTraits({ deadline: 100 });
            expect(await bySigTraitsMock.deadline(value2)).to.be.equal(100);
            const value3 = buildBySigTraits({ deadline: 0xffffffff });
            expect(await bySigTraitsMock.deadline(value3)).to.be.equal(0xffffffff);
        });
    });

    describe('isRelayerAllowed', function () {
        it('should be allowed with non-setted relayer', async function () {
            const { bySigTraitsMock } = await loadFixture(deployAddressArrayMock);
            const value = buildBySigTraits();
            expect(await bySigTraitsMock.isRelayerAllowed(value, bySigTraitsMock)).to.be.equal(true);
            expect(await bySigTraitsMock.isRelayerAllowed(value, constants.EEE_ADDRESS)).to.be.equal(true);
            expect(await bySigTraitsMock.isRelayerAllowed(value, constants.ZERO_ADDRESS)).to.be.equal(true);
        });

        it('should be allowed with setted relayer', async function () {
            const { bySigTraitsMock } = await loadFixture(deployAddressArrayMock);
            const value = buildBySigTraits({ relayer: constants.EEE_ADDRESS });
            expect(await bySigTraitsMock.isRelayerAllowed(value, constants.EEE_ADDRESS)).to.be.equal(true);
        });

        it('should be allowed with setted only 80-bits of relayer address', async function () {
            const { bySigTraitsMock } = await loadFixture(deployAddressArrayMock);
            const relayer = constants.ZERO_ADDRESS.substring(0, 22) + (await bySigTraitsMock.getAddress()).substring(22, 42);
            const value = buildBySigTraits({ relayer });
            expect(await bySigTraitsMock.isRelayerAllowed(value, bySigTraitsMock)).to.be.equal(true);
        });

        it('should be allowed with setted another relayer', async function () {
            const { bySigTraitsMock } = await loadFixture(deployAddressArrayMock);
            const value = buildBySigTraits({ relayer: constants.EEE_ADDRESS });
            expect(await bySigTraitsMock.isRelayerAllowed(value, bySigTraitsMock)).to.be.equal(false);
        });
    });

    describe('nonce', function () {
        it('should return correct nonce', async function () {
            const { bySigTraitsMock } = await loadFixture(deployAddressArrayMock);
            const value = buildBySigTraits({ nonce: 1024 });
            expect(await bySigTraitsMock.nonce(value)).to.be.equal(1024);
        });
    });
});
