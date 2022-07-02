import { expect, constants } from '../../src/prelude';

const ECDSATest = artifacts.require('ECDSATest');
const ERC1271WalletMock = artifacts.require('ERC1271WalletMock');

describe('ECDSA', async () => {
    const TEST_MESSAGE = '1inch-ecdsa-asm-library';
    const HASHED_TEST_MESSAGE = web3.eth.accounts.hashMessage('1inch-ecdsa-asm-library');
    const WRONG_MESSAGE = web3.utils.keccak256('Nope');
    const NON_HASH_MESSAGE = '0x' + Buffer.from('abcd').toString('hex');

    const initContext = async (erc1271owner: string, erc1271ownerV0: string, erc1271ownerV1: string) => {
        const ecdsa = await ECDSATest.new();
        const erc1271wallet = await ERC1271WalletMock.new(erc1271owner);
        const erc1271walletV0 = await ERC1271WalletMock.new(erc1271ownerV0);
        const erc1271walletV1 = await ERC1271WalletMock.new(erc1271ownerV1);
        return { ecdsa, erc1271wallet, erc1271walletV0, erc1271walletV1 };
    };

    const split2 = (signature: string): [string, string] => {
        const raw = web3.utils.hexToBytes(signature);
        switch (raw.length) {
        case 64:
            return [
                web3.utils.bytesToHex(raw.slice(0, 32)), // r
                web3.utils.bytesToHex(raw.slice(32, 64)), // vs
            ];
        case 65: {
            const v = web3.utils.toBN(raw[64]);
            const s = web3.utils.toBN(web3.utils.bytesToHex(raw.slice(32, 64)));
            return [
                web3.utils.bytesToHex(raw.slice(0, 32)), // r
                web3.utils.toHex(s.shln(1).shrn(1).or(v.subn(27).shln(255))), // vs
            ];
        }
        default:
            expect.fail('Invalid signature length, cannot split');
        }
    };

    const split3 = (signature: string): [string, string, string] => {
        const raw = web3.utils.hexToBytes(signature);
        if (raw.length !== 65) {
            expect.fail('Invalid signature length, cannot split');
        }
        return [
            web3.eth.abi.encodeParameter('uint8', raw[64]), // v
            web3.utils.bytesToHex(raw.slice(0, 32)), // r
            web3.utils.bytesToHex(raw.slice(32, 64)), // s
        ];
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

    const randomAccount: string = web3.eth.accounts.create().address;
    // eslint-disable-next-line max-len
    const longSignature = '0x01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789';

    // Signature generated outside ganache with method web3.eth.sign(TEST_MESSAGE, account)
    const signerV0 = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    // eslint-disable-next-line max-len
    const signatureWithoutVersionV0 = '0x064d3d0f049cc3b971476ba4bdbd5d0ccb5ac0ee7a03c2f063908ac2bdb59f944c7c5bf43804a7ff717f8c0a8749e0e5cb26ef96408313558acd130210604d9c';
    const signerV1 = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
    // eslint-disable-next-line max-len
    const signatureWithoutVersionV1 = '0x7bf43cd41b0fe2edad48ab66d2bc8e78d4aad37d0cf77e9fa4668560e1eac68277c325f777b8ee2f9d522c635c252bfdba6ba261edbf53c46c64d47824f2a009';
    // eslint-disable-next-line max-len
    const invalidSignature = '0x332ce75a821c982f9127538858900d87d3ec1f9f737338ad67cad133fa48feff48e6fa0c18abc62e42820f05943e47af3e9fbe306ce74d64094bdf1691ee53e01c';

    before(async () => {
        [account] = await web3.eth.getAccounts();
        context = await initContext(account, signerV0, signerV1);
    });

    describe('recover', async () => {
        describe('with invalid signature', async () => {
            it('with short signature', async function () {
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, '0x1234')).to.be.equals(constants.ZERO_ADDRESS);
            });

            it('with long signature', async () => {
                expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, longSignature)).to.be.equals(constants.ZERO_ADDRESS);
            });
        });

        describe('with valid signature', async () => {
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
                    expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, invalidSignature)).to.be.equals(constants.ZERO_ADDRESS);
                });
            });

            describe('with v0 signature', function () {
                it('returns zero address with 00 as version value', async function () {
                    const version = '00';
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(constants.ZERO_ADDRESS);
                    expect(await context.ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(constants.ZERO_ADDRESS);
                });

                it('works with 27 as version value', async function () {
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(signerV0);
                    expect(await context.ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(signerV0);
                    expect(await context.ecdsa.recover_r_vs(HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(signerV0);
                });

                it('returns zero address when wrong version', async function () {
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    const version = '02';
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(constants.ZERO_ADDRESS);
                    expect(await context.ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(constants.ZERO_ADDRESS);
                });

                it('works with short EIP2098 format', async function () {
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(signerV0);
                    expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(signerV0);
                });
            });

            describe('with v1 signature', function () {
                it('returns zero address with 01 as version value', async function () {
                    const version = '01';
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(constants.ZERO_ADDRESS);
                    expect(await context.ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(constants.ZERO_ADDRESS);
                });

                it('works with 28 as version value', async function () {
                    const version = '1c'; // 28 = 1c.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(signerV1);
                    expect(await context.ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(signerV1);
                    expect(await context.ecdsa.recover_r_vs(HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(signerV1);
                });

                it('returns zero address when wrong version', async function () {
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    const version = '02';
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(constants.ZERO_ADDRESS);
                    expect(await context.ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(constants.ZERO_ADDRESS);
                });

                it('works with short EIP2098 format', async function () {
                    const version = '1c'; // 27 = 1b.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(signerV1);
                    expect(await context.ecdsa.recover(HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(signerV1);
                });
            });
        });
    });

    describe('isValidSignature', async () => {
        describe('with invalid signature', async () => {
            it('with short signature', async function () {
                expect(await context.ecdsa.isValidSignature(context.erc1271wallet.address, HASHED_TEST_MESSAGE, '0x1234')).to.be.equals(false);
            });

            it('with long signature', async () => {
                expect(await context.ecdsa.isValidSignature(context.erc1271wallet.address, HASHED_TEST_MESSAGE, longSignature)).to.be.equals(false);
            });
        });

        describe('with valid signature', async () => {
            describe('using web3.eth.sign', async () => {
                it('returns true with correct signature and only correct signer', async () => {
                    const signature = await web3.eth.sign(TEST_MESSAGE, account);
                    expect(await context.ecdsa.isValidSignature(context.erc1271wallet.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await context.ecdsa.isValidSignature(randomAccount, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                });

                it('returns true with correct signature and only correct signer for arbitrary length message', async () => {
                    const signature = await web3.eth.sign(NON_HASH_MESSAGE, account);
                    expect(await context.ecdsa.isValidSignature(context.erc1271wallet.address, web3.eth.accounts.hashMessage(NON_HASH_MESSAGE), signature)).to.be.equals(true);
                    expect(await context.ecdsa.isValidSignature(randomAccount, web3.eth.accounts.hashMessage(NON_HASH_MESSAGE), signature)).to.be.equals(false);
                });

                it('returns false with invalid signature', async () => {
                    expect(await context.ecdsa.isValidSignature(context.erc1271wallet.address, web3.eth.accounts.hashMessage(NON_HASH_MESSAGE), invalidSignature)).to.be.equals(false);
                });
            });

            describe('with v0 signature', function () {
                it('returns false with 00 as version value', async function () {
                    const version = '00';
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await context.ecdsa.isValidSignature(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.isValidSignature_v_r_s(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                });

                it('returns true with 27 as version value, and only for signer', async function () {
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await context.ecdsa.isValidSignature(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await context.ecdsa.isValidSignature(account, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.isValidSignature_v_r_s(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(true);
                    expect(await context.ecdsa.isValidSignature_v_r_s(account, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                    expect(await context.ecdsa.isValidSignature_r_vs(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(true);
                    expect(await context.ecdsa.isValidSignature_r_vs(account, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(false);
                });

                it('returns false when wrong version', async function () {
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    const version = '02';
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await context.ecdsa.isValidSignature(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.isValidSignature_v_r_s(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                });

                it('returns true with short EIP2098 format, and only for signer', async function () {
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await context.ecdsa.isValidSignature(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(true);
                    expect(await context.ecdsa.isValidSignature(account, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(false);
                    expect(await context.ecdsa.isValidSignature(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(true);
                    expect(await context.ecdsa.isValidSignature(account, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(false);
                });
            });

            describe('with v1 signature', function () {
                it('returns false with 01 as version value', async function () {
                    const version = '01';
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await context.ecdsa.isValidSignature(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.isValidSignature_v_r_s(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                });

                it('returns true with 28 as version value, and only for signer', async function () {
                    const version = '1c'; // 28 = 1c.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await context.ecdsa.isValidSignature(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await context.ecdsa.isValidSignature(account, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.isValidSignature_v_r_s(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(true);
                    expect(await context.ecdsa.isValidSignature_v_r_s(account, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                    expect(await context.ecdsa.isValidSignature_r_vs(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(true);
                    expect(await context.ecdsa.isValidSignature_r_vs(account, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(false);
                });

                it('returns false when wrong version', async function () {
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    const version = '02';
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await context.ecdsa.isValidSignature(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.isValidSignature_v_r_s(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                });

                it('returns true with short EIP2098 format, and only for signer', async function () {
                    const version = '1c'; // 27 = 1b.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await context.ecdsa.isValidSignature(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(true);
                    expect(await context.ecdsa.isValidSignature(account, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(false);
                    expect(await context.ecdsa.isValidSignature(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(true);
                    expect(await context.ecdsa.isValidSignature(account, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(false);
                });
            });

            describe('isValidSignature65', async () => {
                it('with matching signer and signature', async function () {
                    const signature = await web3.eth.sign(TEST_MESSAGE, account);
                    expect(await context.ecdsa.isValidSignature65(context.erc1271wallet.address, HASHED_TEST_MESSAGE, ...split2(signature))).to.be.equals(true);
                });

                it('with invalid signer', async function () {
                    const signature = await web3.eth.sign(TEST_MESSAGE, account);
                    expect(await context.ecdsa.isValidSignature65(randomAccount, HASHED_TEST_MESSAGE, ...split2(signature))).to.be.equals(false);
                });

                it('with invalid signature', async function () {
                    const signature = await web3.eth.sign(TEST_MESSAGE, account);
                    const HASHED_WRONG_MESSAGE = web3.eth.accounts.hashMessage(WRONG_MESSAGE);
                    expect(await context.ecdsa.isValidSignature65(context.erc1271wallet.address, HASHED_WRONG_MESSAGE, ...split2(signature))).to.be.equals(false);
                });
            });
        });
    });

    describe('recoverOrIsValidSignature', async () => {
        describe('with invalid signature', async () => {
            it('with short signature', async function () {
                expect(await context.ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, '0x1234')).to.be.equals(false);
                expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271wallet.address, HASHED_TEST_MESSAGE, '0x1234')).to.be.equals(false);
            });

            it('with long signature', async () => {
                expect(await context.ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, longSignature)).to.be.equals(false);
                expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271wallet.address, HASHED_TEST_MESSAGE, longSignature)).to.be.equals(false);
            });
        });

        describe('with valid signature', async () => {
            describe('using web3.eth.sign', async () => {
                it('returns true with correct signature and only correct signer', async () => {
                    const signature = await web3.eth.sign(TEST_MESSAGE, account);
                    expect(await context.ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(randomAccount, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271wallet.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                });

                it('returns true with correct signature and only correct signer for arbitrary length message', async () => {
                    const signature = await web3.eth.sign(NON_HASH_MESSAGE, account);
                    expect(await context.ecdsa.recoverOrIsValidSignature(account, web3.eth.accounts.hashMessage(NON_HASH_MESSAGE), signature)).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(randomAccount, web3.eth.accounts.hashMessage(NON_HASH_MESSAGE), signature)).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271wallet.address, web3.eth.accounts.hashMessage(NON_HASH_MESSAGE), signature)).to.be.equals(true);
                });

                it('returns false with invalid signature', async () => {
                    expect(await context.ecdsa.recoverOrIsValidSignature(account, web3.eth.accounts.hashMessage(NON_HASH_MESSAGE), invalidSignature)).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271wallet.address, web3.eth.accounts.hashMessage(NON_HASH_MESSAGE), invalidSignature)).to.be.equals(false);
                });
            });

            describe('with v0 signature', function () {
                it('returns false with 00 as version value', async function () {
                    const version = '00';
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await context.ecdsa.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(signerV0, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                });

                it('returns true with 27 as version value, and only for signer', async function () {
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await context.ecdsa.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(signerV0, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(account, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature_r_vs(signerV0, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature_r_vs(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature_r_vs(account, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(false);
                });

                it('returns false when wrong version', async function () {
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    const version = '02';
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await context.ecdsa.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(signerV0, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                });

                it('returns true with short EIP2098 format, and only for signer', async function () {
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await context.ecdsa.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(false);
                });
            });

            describe('with v1 signature', function () {
                it('returns false with 01 as version value', async function () {
                    const version = '01';
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await context.ecdsa.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(signerV1, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                });

                it('returns true with 28 as version value, and only for signer', async function () {
                    const version = '1c'; // 28 = 1c.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await context.ecdsa.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(signerV1, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(account, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature_r_vs(signerV1, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature_r_vs(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature_r_vs(account, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(false);
                });

                it('returns false when wrong version', async function () {
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    const version = '02';
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await context.ecdsa.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(signerV1, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature_v_r_s(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                });

                it('returns true with short EIP2098 format, and only for signer', async function () {
                    const version = '1c'; // 27 = 1b.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await context.ecdsa.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(false);
                });
            });

            describe('recoverOrIsValidSignature65', async () => {
                it('with matching signer and signature', async function () {
                    const signature = await web3.eth.sign(TEST_MESSAGE, account);
                    expect(await context.ecdsa.recoverOrIsValidSignature65(account, HASHED_TEST_MESSAGE, ...split2(signature))).to.be.equals(true);
                    expect(await context.ecdsa.recoverOrIsValidSignature65(context.erc1271wallet.address, HASHED_TEST_MESSAGE, ...split2(signature))).to.be.equals(true);
                });

                it('with invalid signer', async function () {
                    const signature = await web3.eth.sign(TEST_MESSAGE, account);
                    expect(await context.ecdsa.recoverOrIsValidSignature65(randomAccount, HASHED_TEST_MESSAGE, ...split2(signature))).to.be.equals(false);
                });

                it('with invalid signature', async function () {
                    const signature = await web3.eth.sign(TEST_MESSAGE, account);
                    const HASHED_WRONG_MESSAGE = web3.eth.accounts.hashMessage(WRONG_MESSAGE);
                    expect(await context.ecdsa.recoverOrIsValidSignature65(account, HASHED_WRONG_MESSAGE, ...split2(signature))).to.be.equals(false);
                    expect(await context.ecdsa.recoverOrIsValidSignature65(context.erc1271wallet.address, HASHED_WRONG_MESSAGE, ...split2(signature))).to.be.equals(false);
                });
            });
        });
    });

    describe('toEthSignedMessageHash', async () => {
        it('correct hash', async function () {
            const hashedTestMessageWithoutPrefix = HASHED_TEST_MESSAGE.substring(2);
            const ethSignedMessage = web3.utils.sha3(web3.utils.toHex(`\u0019Ethereum Signed Message:\n${hashedTestMessageWithoutPrefix.length/2}`) + hashedTestMessageWithoutPrefix);
            expect(await context.ecdsa.toEthSignedMessageHash(HASHED_TEST_MESSAGE)).to.be.equals(ethSignedMessage);
        });
    });

    describe('toTypedDataHash', async () => {
        it('correct hash', async function () {
            const domainSeparator = HASHED_TEST_MESSAGE.substring(2);
            const structHash = HASHED_TEST_MESSAGE.substring(2);
            const typedDataHash = web3.utils.sha3(web3.utils.toHex('\x19\x01') + domainSeparator + structHash);
            expect(await context.ecdsa.toTypedDataHash(HASHED_TEST_MESSAGE, HASHED_TEST_MESSAGE)).to.be.equals(typedDataHash);
        });
    });

    describe('gas price', async () => {
        describe('recover', async () => {
            it('with signature', async function () {
                const signature = await web3.eth.sign(TEST_MESSAGE, account);
                await context.ecdsa.contract.methods.recover(HASHED_TEST_MESSAGE, signature).send({ from: account });
            });

            it('with v0 signature', async () => {
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await context.ecdsa.contract.methods.recover(HASHED_TEST_MESSAGE, signature).send({ from: account });
                await context.ecdsa.contract.methods.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature)).send({ from: account });
                await context.ecdsa.contract.methods.recover_r_vs(HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))).send({ from: account });
            });

            it('with v1 signature', async () => {
                const version = '1c'; // 28 = 1c.
                const signature = signatureWithoutVersionV1 + version;
                await context.ecdsa.contract.methods.recover(HASHED_TEST_MESSAGE, signature).send({ from: account });
                await context.ecdsa.contract.methods.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature)).send({ from: account });
                await context.ecdsa.contract.methods.recover_r_vs(HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))).send({ from: account });
            });
        });

        describe('recoverOrIsValidSignature', async () => {
            it('with signature', async function () {
                const signature = await web3.eth.sign(TEST_MESSAGE, account);
                await context.ecdsa.contract.methods.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, signature).send({ from: account });
                await context.ecdsa.contract.methods.recoverOrIsValidSignature(context.erc1271wallet.address, HASHED_TEST_MESSAGE, signature).send({ from: account });
            });

            it('with v0 signature', async () => {
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await context.ecdsa.contract.methods.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, signature).send({ from: account });
                await context.ecdsa.contract.methods.recoverOrIsValidSignature(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, signature).send({ from: account });
                await context.ecdsa.contract.methods.recoverOrIsValidSignature_v_r_s(signerV0, HASHED_TEST_MESSAGE, ...split3(signature)).send({ from: account });
                await context.ecdsa.contract.methods.recoverOrIsValidSignature_v_r_s(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split3(signature)).send({ from: account });
                await context.ecdsa.contract.methods.recoverOrIsValidSignature_r_vs(signerV0, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))).send({ from: account });
                await context.ecdsa.contract.methods.recoverOrIsValidSignature_r_vs(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))).send({ from: account });
            });

            it('with v1 signature', async () => {
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await context.ecdsa.contract.methods.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, signature).send({ from: account });
                await context.ecdsa.contract.methods.recoverOrIsValidSignature(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, signature).send({ from: account });
                await context.ecdsa.contract.methods.recoverOrIsValidSignature_v_r_s(signerV1, HASHED_TEST_MESSAGE, ...split3(signature)).send({ from: account });
                await context.ecdsa.contract.methods.recoverOrIsValidSignature_v_r_s(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split3(signature)).send({ from: account });
                await context.ecdsa.contract.methods.recoverOrIsValidSignature_r_vs(signerV1, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))).send({ from: account });
                await context.ecdsa.contract.methods.recoverOrIsValidSignature_r_vs(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))).send({ from: account });
            });

            it('recoverOrIsValidSignature65', async () => {
                const signature = await web3.eth.sign(TEST_MESSAGE, account);
                await context.ecdsa.contract.methods.recoverOrIsValidSignature65(account, HASHED_TEST_MESSAGE, ...split2(signature)).send({ from: account });
                await context.ecdsa.contract.methods.recoverOrIsValidSignature65(context.erc1271wallet.address, HASHED_TEST_MESSAGE, ...split2(signature)).send({ from: account });
            });
        });

        describe('isValidSignature', async () => {
            it('with signature', async function () {
                const signature = await web3.eth.sign(TEST_MESSAGE, account);
                await context.ecdsa.contract.methods.isValidSignature(context.erc1271wallet.address, HASHED_TEST_MESSAGE, signature).send({ from: account });
            });

            it('with v0 signature', async () => {
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await context.ecdsa.contract.methods.isValidSignature(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, signature).send({ from: account });
                await context.ecdsa.contract.methods.isValidSignature_v_r_s(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split3(signature)).send({ from: account });
                await context.ecdsa.contract.methods.isValidSignature_r_vs(context.erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))).send({ from: account });
            });

            it('with v1 signature', async () => {
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await context.ecdsa.contract.methods.isValidSignature(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, signature).send({ from: account });
                await context.ecdsa.contract.methods.isValidSignature_v_r_s(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split3(signature)).send({ from: account });
                await context.ecdsa.contract.methods.isValidSignature_r_vs(context.erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))).send({ from: account });
            });

            it('isValidSignature65', async () => {
                const signature = await web3.eth.sign(TEST_MESSAGE, account);
                await context.ecdsa.contract.methods.isValidSignature65(context.erc1271wallet.address, HASHED_TEST_MESSAGE, ...split2(signature)).send({ from: account });
            });
        });

        describe('Additional methods', async () => {
            it('toEthSignedMessageHash', async function () {
                await context.ecdsa.contract.methods.toEthSignedMessageHash(HASHED_TEST_MESSAGE).send({ from: account });
            });

            it('toTypedDataHash', async function () {
                await context.ecdsa.contract.methods.toTypedDataHash(HASHED_TEST_MESSAGE, HASHED_TEST_MESSAGE).send({ from: account });
            });
        });
    });
});
