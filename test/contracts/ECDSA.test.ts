import { expect, constants } from '../../src/prelude';

const ECDSATest = artifacts.require('ECDSATest');

describe('ECDSA', async () => {
    const TEST_MESSAGE = '1inch-ecdsa-asm-library';
    const HASHED_TEST_MESSAGE = web3.eth.accounts.hashMessage('1inch-ecdsa-asm-library');
    const WRONG_MESSAGE = web3.utils.keccak256('Nope');
    const NON_HASH_MESSAGE = '0x' + Buffer.from('abcd').toString('hex');

    const initContext = async () => {
        const ecdsa = await ECDSATest.new();
        return { ecdsa };
    };

    const split = (signature: string): string[] => {
        const raw = web3.utils.hexToBytes(signature);
        switch (raw.length) {
        case 64:
            return [
                web3.utils.bytesToHex(raw.slice(0, 32)), // r
                web3.utils.bytesToHex(raw.slice(32, 64)), // vs
            ];
        case 65:
            return [
                web3.eth.abi.encodeParameter('uint8', raw[64]), // v
                web3.utils.bytesToHex(raw.slice(0, 32)), // r
                web3.utils.bytesToHex(raw.slice(32, 64)), // s
            ];
        default:
            expect.fail('Invalid signature length, cannot split');
        }
    };

    const to2098Format = (signature: string): string => {
        const long = web3.utils.hexToBytes(signature);
        if (long.length !== 65) {
            expect.fail('Invalid signature length (expected long format)');
        }
        if (long[32] >> 7 === 1) {
            expect.fail('Invalid signature \'s\' value');
        }
        const short = long.slice(0, 64);
        short[32] |= (long[64] % 27) << 7; // set the first bit of the 32nd byte to the v parity bit
        return web3.utils.bytesToHex(short);
    };

    const from2098Format = (signature: string): string => {
        const short = web3.utils.hexToBytes(signature);
        if (short.length !== 64) {
            expect.fail('Invalid signature length (expected short format)');
            throw new Error('');
        }
        short.push((short[32] >> 7) + 27);
        short[32] &= (1 << 7) - 1; // zero out the first bit of 1 the 32nd byte
        return web3.utils.bytesToHex(short);
    };

    let account: string;
    let context: Awaited<ReturnType<typeof initContext>> = undefined!;

    before(async () => {
        [account] = await web3.eth.getAccounts();
        context = await initContext();
    });

    describe('recover with invalid signature', async () => {
        it('with short signature', async function () {
            expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, '0x1234')).to.be.equals(constants.ZERO_ADDRESS);
        });

        it('with long signature', async () => {
            // eslint-disable-next-line max-len
            const longSignature = '0x01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789';
            expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, longSignature)).to.be.equals(constants.ZERO_ADDRESS);
        });
    });

    describe('recover with valid signature', async () => {
        describe('using web3.eth.sign', async () => {
            it('returns signer address with correct signature', async () => {
                const signature = await web3.eth.sign(TEST_MESSAGE, account);
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(account);
            });

            it('returns signer address with correct signature for arbitrary length message', async () => {
                const signature = await web3.eth.sign(NON_HASH_MESSAGE, account);
                expect(await context.ecdsa.recover(web3.eth.accounts.hashMessage(NON_HASH_MESSAGE), signature)).to.be.equals(account);
            });

            it('returns a different address', async () => {
                const signature = await web3.eth.sign(TEST_MESSAGE, account);
                expect(await context.ecdsa.recover(WRONG_MESSAGE, signature)).to.be.not.equals(account);
            });

            it('returns zero address with invalid signature', async () => {
                // eslint-disable-next-line max-len
                const signature = '0x332ce75a821c982f9127538858900d87d3ec1f9f737338ad67cad133fa48feff48e6fa0c18abc62e42820f05943e47af3e9fbe306ce74d64094bdf1691ee53e01c';
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(constants.ZERO_ADDRESS);
            });
        });

        describe('with v0 signature', function () {
            // Signature generated outside ganache with method web3.eth.sign(TEST_MESSAGE, account)
            const signer = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
            // eslint-disable-next-line max-len
            const signatureWithoutVersion = '0x064d3d0f049cc3b971476ba4bdbd5d0ccb5ac0ee7a03c2f063908ac2bdb59f944c7c5bf43804a7ff717f8c0a8749e0e5cb26ef96408313558acd130210604d9c';

            it('returns zero address with 00 as version value', async function () {
                const version = '00';
                const signature = signatureWithoutVersion + version;
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(constants.ZERO_ADDRESS);
                expect(await context.ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split(signature))).to.be.equals(constants.ZERO_ADDRESS);
            });

            it('works with 27 as version value', async function () {
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersion + version;
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(signer);
                expect(await context.ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split(signature))).to.be.equals(signer);
                expect(await context.ecdsa.recover_r_vs(HASHED_TEST_MESSAGE, ...split(to2098Format(signature)))).to.equal(signer);
            });

            it('returns zero address when wrong version', async function () {
                // The last two hex digits are the signature version.
                // The only valid values are 0, 1, 27 and 28.
                const version = '02';
                const signature = signatureWithoutVersion + version;
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(constants.ZERO_ADDRESS);
                expect(await context.ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split(signature))).to.be.equals(constants.ZERO_ADDRESS);
            });

            it('works with short EIP2098 format', async function () {
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersion + version;
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(signer);
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(signer);
            });
        });

        describe('with v1 signature', function () {
            const signer = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
            // eslint-disable-next-line max-len
            const signatureWithoutVersion = '0x7bf43cd41b0fe2edad48ab66d2bc8e78d4aad37d0cf77e9fa4668560e1eac68277c325f777b8ee2f9d522c635c252bfdba6ba261edbf53c46c64d47824f2a009';

            it('returns zero address with 01 as version value', async function () {
                const version = '01';
                const signature = signatureWithoutVersion + version;
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(constants.ZERO_ADDRESS);
                expect(await context.ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split(signature))).to.be.equals(constants.ZERO_ADDRESS);
            });

            it('works with 28 as version value', async function () {
                const version = '1c'; // 28 = 1c.
                const signature = signatureWithoutVersion + version;
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(signer);
                expect(await context.ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split(signature))).to.be.equals(signer);
                expect(await context.ecdsa.recover_r_vs(HASHED_TEST_MESSAGE, ...split(to2098Format(signature)))).to.equal(signer);
            });

            it('returns zero address when wrong version', async function () {
                // The last two hex digits are the signature version.
                // The only valid values are 0, 1, 27 and 28.
                const version = '02';
                const signature = signatureWithoutVersion + version;
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(constants.ZERO_ADDRESS);
                expect(await context.ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split(signature))).to.be.equals(constants.ZERO_ADDRESS);
            });

            it('works with short EIP2098 format', async function () {
                const version = '1c'; // 27 = 1b.
                const signature = signatureWithoutVersion + version;
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(signer);
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(signer);
            });
        });
    });
});
