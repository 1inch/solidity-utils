import { constants } from '../../src/prelude';
import { expect } from '../../src/expect';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { trim0x } from '../../src';

describe('OtpModule', function () {
    function generateOtpChain(secret: string, user: string, length = 20) {
        const codes = [];
        let k = ethers.keccak256(Buffer.from(trim0x(secret), 'hex'));
        const userBuf = Buffer.from(trim0x(user), 'hex');

        for (let i = 0; i < length; i++) {
            codes.push(k);
            const kBuf = Buffer.from(trim0x(k), 'hex');
            k = ethers.keccak256(Buffer.concat([kBuf, userBuf]));
        }

        return codes;
    }

    function decodePackedOtp(packed: bigint) {
        const remaining = Number(packed >> 224n); // high 32 bits
        const expected = '0x' + (packed & ((1n << 224n) - 1n)).toString(16).padStart(56, '0'); // low 224 bits
        return { expected, remaining };
    }

    async function deployTokenWithOtp() {
        const [alice, bob, carol] = await ethers.getSigners();
        const TokenWithOtpModule = await ethers.getContractFactory('TokenWithOtpModule');
        const token = await TokenWithOtpModule.deploy('Token', 'TKN', '1');

        const codes = {
            alice: generateOtpChain('ALICE SECRET', alice.address),
            bob: generateOtpChain('BOB SECRET', bob.address),
            carol: generateOtpChain('CAROL SECRET', carol.address),
        };
        await token.mint(bob.address, 1000);
        await token.connect(bob).setOTP(codes.bob[19], 19, constants.ZERO_BYTES32);

        return { addrs: { alice, bob, carol }, token, codes };
    }

    describe('setOTP', function () {
        it('should set otp correct when it is not set', async function () {
            const { addrs: { alice }, token, codes } = await loadFixture(deployTokenWithOtp);
            await token.setOTP(codes.alice[19], 19, constants.ZERO_BYTES32);
            const { expected, remaining } = decodePackedOtp(await token.otp(alice.address));
            expect(trim0x(expected)).to.be.equal(codes.alice[19].slice(-56));
            expect(remaining).to.be.equal(19);
        });

        it('should reset otp correct', async function () {
            const { addrs: { alice }, token, codes } = await loadFixture(deployTokenWithOtp);
            await token.setOTP(codes.alice[19], 19, constants.ZERO_BYTES32);
            await token.setOTP(codes.alice[10], 10, codes.alice[18]);
            const { expected, remaining } = decodePackedOtp(await token.otp(alice.address));
            expect(trim0x(expected)).to.be.equal(codes.alice[10].slice(-56));
            expect(remaining).to.be.equal(10);
        });

        it('should not reset otp with wrong code', async function () {
            const { token, codes } = await loadFixture(deployTokenWithOtp);
            await token.setOTP(codes.alice[19], 19, constants.ZERO_BYTES32);
            await expect(token.setOTP(codes.alice[10], 10, codes.alice[10]))
                .to.be.revertedWithCustomError(token, 'BadOTP');
        });

        it('should not reset otp with total = 0', async function () {
            const { token, codes } = await loadFixture(deployTokenWithOtp);
            await expect(token.setOTP(codes.alice[19], 0, constants.ZERO_BYTES32))
                .to.be.revertedWithCustomError(token, 'IncorrectOtpAmount');
        });
    });

    describe('modifier', function () {
        it('should transfer with correct otp code', async function () {
            const { addrs: { alice, bob }, token, codes } = await loadFixture(deployTokenWithOtp);
            const tx = token.connect(bob).transferWithOTP(codes.bob[18], alice, 100);
            await expect(tx).to.be.changeTokenBalances(token, [alice, bob], [100, -100]);
        });

        it('should not transfer with incorrect otp code', async function () {
            const { addrs: { alice, bob }, token, codes } = await loadFixture(deployTokenWithOtp);
            await expect(token.connect(bob).transferWithOTP(codes.bob[17], alice, 100))
                .to.be.revertedWithCustomError(token, 'BadOTP');
        });

        it('should transfer until otp exhausted', async function () {
            const { addrs: { alice, bob }, token, codes } = await loadFixture(deployTokenWithOtp);
            for (let i = 18; i >= 0; i--) {
                await token.connect(bob).transferWithOTP(codes.bob[i], alice, 10);
            }
            await expect(token.connect(bob).transferWithOTP(codes.bob[0], alice, 10))
                .to.be.revertedWithCustomError(token, 'OtpExhausted');
        });
    });
});
