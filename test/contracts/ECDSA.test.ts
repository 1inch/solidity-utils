import { expect, constants } from '../../src/prelude';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Wallet } from 'ethers';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { arrayify, concat } from 'ethers/lib/utils';

describe('ECDSA', async function () {
    let account: SignerWithAddress;
    let randomAccount: Wallet;

    before(async () => {
        [account] = await ethers.getSigners();
        randomAccount = await ethers.Wallet.createRandom();
    });

    const deployContracts = async function () {
        const ECDSATest = await ethers.getContractFactory('ECDSATest');
        const ecdsa = await ECDSATest.deploy();
        const ERC1271WalletMock = await ethers.getContractFactory('ERC1271WalletMock');
        const erc1271wallet = await ERC1271WalletMock.deploy(account.address);
        const erc1271walletV0 = await ERC1271WalletMock.deploy(signerV0);
        const erc1271walletV1 = await ERC1271WalletMock.deploy(signerV1);

        return { ecdsa, erc1271wallet, erc1271walletV0, erc1271walletV1 };
    };

    const TEST_MESSAGE = '1inch-ecdsa-asm-library';
    const HASHED_TEST_MESSAGE = ethers.utils.hashMessage('1inch-ecdsa-asm-library');
    const WRONG_MESSAGE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Nope'));
    const NON_HASH_MESSAGE = arrayify('0x' + Buffer.from('abcd').toString('hex'));

    const split2 = (signature: string): [string, string] => {
        const { r, _vs } = ethers.utils.splitSignature(signature);
        return [r, _vs];
    };

    const split3 = (signature: string): [string, string, string] => {
        const { v, r, s } = ethers.utils.splitSignature(signature);
        return [v.toString(), r, s];
    };

    const to2098Format = (signature: string): string => {
        const { compact } = ethers.utils.splitSignature(signature);
        return compact;
    };

    const from2098Format = (signature: string): string => {
        const { v, r, s } = ethers.utils.splitSignature(signature);
        const ret = ethers.utils.hexConcat([r, s, arrayify(v)]);
        return ret;
    };

    // eslint-disable-next-line max-len
    const longSignature = '0x01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789';

    // Signature generated outside ganache
    const signerV0 = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    // eslint-disable-next-line max-len
    const signatureWithoutVersionV0 = '0x064d3d0f049cc3b971476ba4bdbd5d0ccb5ac0ee7a03c2f063908ac2bdb59f944c7c5bf43804a7ff717f8c0a8749e0e5cb26ef96408313558acd130210604d9c';
    const signerV1 = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
    // eslint-disable-next-line max-len
    const signatureWithoutVersionV1 = '0x7bf43cd41b0fe2edad48ab66d2bc8e78d4aad37d0cf77e9fa4668560e1eac68277c325f777b8ee2f9d522c635c252bfdba6ba261edbf53c46c64d47824f2a009';
    // eslint-disable-next-line max-len
    const invalidSignature = '0x332ce75a821c982f9127538858900d87d3ec1f9f737338ad67cad133fa48feff48e6fa0c18abc62e42820f05943e47af3e9fbe306ce74d64094bdf1691ee53e01c';

    describe('recover', async () => {
        describe('with invalid signature', async () => {
            it('with short signature', async function () {
                const { ecdsa } = await loadFixture(deployContracts);
                expect(await ecdsa.recover(HASHED_TEST_MESSAGE, '0x1234')).to.be.equals(constants.ZERO_ADDRESS);
            });

            it('with long signature', async () => {
                const { ecdsa } = await loadFixture(deployContracts);
                expect(await ecdsa.recover(HASHED_TEST_MESSAGE, longSignature)).to.be.equals(constants.ZERO_ADDRESS);
            });
        });

        describe('with valid signature', async () => {
            describe('using account.signMessage', async () => {
                it('returns signer address with correct signature', async () => {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(account.address);
                });

                it('returns signer address with correct signature for arbitrary length message', async () => {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(NON_HASH_MESSAGE);
                    expect(await ecdsa.recover(ethers.utils.hashMessage(NON_HASH_MESSAGE), signature)).to.be.equals(account.address);
                });

                it('returns a different address', async () => {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(await ecdsa.recover(WRONG_MESSAGE, signature)).to.be.not.equals(account.address);
                });

                it('returns zero address with invalid signature', async () => {
                    const { ecdsa } = await loadFixture(deployContracts);
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, invalidSignature)).to.be.equals(constants.ZERO_ADDRESS);
                });
            });

            describe('with v0 signature', function () {
                it('returns zero address with 00 as version value', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const version = '00';
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(constants.ZERO_ADDRESS);
                    const [, r, s] = split3(signature);
                    expect(await ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, 0, r, s)).to.be.equals(constants.ZERO_ADDRESS);
                });

                it('works with 27 as version value', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(signerV0);
                    expect(await ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(signerV0);
                    expect(await ecdsa.recover_r_vs(HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(signerV0);
                });

                it('returns zero address when wrong version', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signatureWithoutVersionV0 + '02')).to.be.equals(constants.ZERO_ADDRESS);
                    const [, r, s] = split3(signatureWithoutVersionV0 + '00');
                    expect(await ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, 2, r, s)).to.be.equals(constants.ZERO_ADDRESS);
                });

                it('works with short EIP2098 format', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(signerV0);
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(signerV0);
                });
            });

            describe('with v1 signature', function () {
                it('returns zero address with 01 as version value', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const version = '01';
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(constants.ZERO_ADDRESS);
                    const [, r, s] = split3(signature);
                    expect(await ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, 1, r, s)).to.be.equals(constants.ZERO_ADDRESS);
                });

                it('works with 28 as version value', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const version = '1c'; // 28 = 1c.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(signerV1);
                    expect(await ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(signerV1);
                    expect(await ecdsa.recover_r_vs(HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(signerV1);
                });

                it('returns zero address when wrong version', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signatureWithoutVersionV1 + '02')).to.be.equals(constants.ZERO_ADDRESS);
                    const [, r, s] = split3(signatureWithoutVersionV1 + '01');
                    expect(await ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, 2, r, s)).to.be.equals(constants.ZERO_ADDRESS);
                });

                it('works with short EIP2098 format', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const version = '1c'; // 27 = 1b.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(signerV1);
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(signerV1);
                });
            });
        });
    });

    describe('isValidSignature', async () => {
        describe('with invalid signature', async () => {
            it('with short signature', async function () {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                expect(await ecdsa.isValidSignature(erc1271wallet.address, HASHED_TEST_MESSAGE, '0x1234')).to.be.equals(false);
            });

            it('with long signature', async () => {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                expect(await ecdsa.isValidSignature(erc1271wallet.address, HASHED_TEST_MESSAGE, longSignature)).to.be.equals(false);
            });
        });

        describe('with valid signature', async () => {
            describe('using account.signMesage', async () => {
                it('returns true with correct signature and only correct signer', async () => {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(await ecdsa.isValidSignature(erc1271wallet.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await ecdsa.isValidSignature(randomAccount.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                });

                it('returns true with correct signature and only correct signer for arbitrary length message', async () => {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(NON_HASH_MESSAGE);
                    expect(await ecdsa.isValidSignature(erc1271wallet.address, ethers.utils.hashMessage(NON_HASH_MESSAGE), signature)).to.be.equals(true);
                    expect(await ecdsa.isValidSignature(randomAccount.address, ethers.utils.hashMessage(NON_HASH_MESSAGE), signature)).to.be.equals(false);
                });

                it('returns false with invalid signature', async () => {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    expect(await ecdsa.isValidSignature(erc1271wallet.address, ethers.utils.hashMessage(NON_HASH_MESSAGE), invalidSignature)).to.be.equals(false);
                });
            });

            describe('with v0 signature', function () {
                it('returns false with 00 as version value', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    const version = '00';
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await ecdsa.isValidSignature(erc1271walletV0.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    const [, r, s] = split3(signature);
                    expect(await ecdsa.isValidSignature_v_r_s(erc1271walletV0.address, HASHED_TEST_MESSAGE, 0, r, s)).to.be.equals(false);
                });

                it('returns true with 27 as version value, and only for signer', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await ecdsa.isValidSignature(erc1271walletV0.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await ecdsa.isValidSignature(account.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await ecdsa.isValidSignature_v_r_s(erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(true);
                    expect(await ecdsa.isValidSignature_v_r_s(account.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                    expect(await ecdsa.isValidSignature_r_vs(erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(true);
                    expect(await ecdsa.isValidSignature_r_vs(account.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(false);
                });

                it('returns false when wrong version', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    expect(await ecdsa.isValidSignature(erc1271walletV0.address, HASHED_TEST_MESSAGE, signatureWithoutVersionV0 + '02')).to.be.equals(false);
                    const [, r, s] = split3(signatureWithoutVersionV1 + '01');
                    expect(await ecdsa.isValidSignature_v_r_s(erc1271walletV0.address, HASHED_TEST_MESSAGE, 2, r, s)).to.be.equals(false);
                });

                it('returns true with short EIP2098 format, and only for signer', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await ecdsa.isValidSignature(erc1271walletV0.address, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(true);
                    expect(await ecdsa.isValidSignature(account.address, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(false);
                    expect(await ecdsa.isValidSignature(erc1271walletV0.address, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(true);
                    expect(await ecdsa.isValidSignature(account.address, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(false);
                });
            });

            describe('with v1 signature', function () {
                it('returns false with 01 as version value', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    expect(await ecdsa.isValidSignature(erc1271walletV1.address, HASHED_TEST_MESSAGE, signatureWithoutVersionV1 + '01')).to.be.equals(false);
                    const [, r, s] = split3(signatureWithoutVersionV1 + '01');
                    expect(await ecdsa.isValidSignature_v_r_s(erc1271walletV1.address, HASHED_TEST_MESSAGE, 1, r, s)).to.be.equals(false);
                });

                it('returns true with 28 as version value, and only for signer', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    const version = '1c'; // 28 = 1c.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await ecdsa.isValidSignature(erc1271walletV1.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await ecdsa.isValidSignature(account.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await ecdsa.isValidSignature_v_r_s(erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(true);
                    expect(await ecdsa.isValidSignature_v_r_s(account.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                    expect(await ecdsa.isValidSignature_r_vs(erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(true);
                    expect(await ecdsa.isValidSignature_r_vs(account.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(false);
                });

                it('returns false when wrong version', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    expect(await ecdsa.isValidSignature(erc1271walletV1.address, HASHED_TEST_MESSAGE, signatureWithoutVersionV1 + '02')).to.be.equals(false);
                    const [, r, s] = split3(signatureWithoutVersionV1 + '01');
                    expect(await ecdsa.isValidSignature_v_r_s(erc1271walletV1.address, HASHED_TEST_MESSAGE, 2, r, s)).to.be.equals(false);
                });

                it('returns true with short EIP2098 format, and only for signer', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    const version = '1c'; // 27 = 1b.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await ecdsa.isValidSignature(erc1271walletV1.address, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(true);
                    expect(await ecdsa.isValidSignature(account.address, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(false);
                    expect(await ecdsa.isValidSignature(erc1271walletV1.address, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(true);
                    expect(await ecdsa.isValidSignature(account.address, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(false);
                });
            });

            describe('isValidSignature65', async () => {
                it('with matching signer and signature', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(await ecdsa.isValidSignature65(erc1271wallet.address, HASHED_TEST_MESSAGE, ...split2(signature))).to.be.equals(true);
                });

                it('with invalid signer', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(await ecdsa.isValidSignature65(randomAccount.address, HASHED_TEST_MESSAGE, ...split2(signature))).to.be.equals(false);
                });

                it('with invalid signature', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    const HASHED_WRONG_MESSAGE = ethers.utils.hashMessage(WRONG_MESSAGE);
                    expect(await ecdsa.isValidSignature65(erc1271wallet.address, HASHED_WRONG_MESSAGE, ...split2(signature))).to.be.equals(false);
                });
            });
        });
    });

    describe('recoverOrIsValidSignature', async () => {
        describe('with invalid signature', async () => {
            it('with short signature', async function () {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                expect(await ecdsa.recoverOrIsValidSignature(account.address, HASHED_TEST_MESSAGE, '0x1234')).to.be.equals(false);
                expect(await ecdsa.recoverOrIsValidSignature(erc1271wallet.address, HASHED_TEST_MESSAGE, '0x1234')).to.be.equals(false);
            });

            it('with long signature', async () => {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                expect(await ecdsa.recoverOrIsValidSignature(account.address, HASHED_TEST_MESSAGE, longSignature)).to.be.equals(false);
                expect(await ecdsa.recoverOrIsValidSignature(erc1271wallet.address, HASHED_TEST_MESSAGE, longSignature)).to.be.equals(false);
            });
        });

        describe('with valid signature', async () => {
            describe('using account.signMessage', async () => {
                it('returns true with correct signature and only correct signer', async () => {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(await ecdsa.recoverOrIsValidSignature(account.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(randomAccount.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature(erc1271wallet.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                });

                it('returns true with correct signature and only correct signer for arbitrary length message', async () => {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(NON_HASH_MESSAGE);
                    expect(await ecdsa.recoverOrIsValidSignature(account.address, ethers.utils.hashMessage(NON_HASH_MESSAGE), signature)).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(randomAccount.address, ethers.utils.hashMessage(NON_HASH_MESSAGE), signature)).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature(erc1271wallet.address, ethers.utils.hashMessage(NON_HASH_MESSAGE), signature)).to.be.equals(true);
                });

                it('returns false with invalid signature', async () => {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    expect(await ecdsa.recoverOrIsValidSignature(account.address, ethers.utils.hashMessage(NON_HASH_MESSAGE), invalidSignature)).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature(erc1271wallet.address, ethers.utils.hashMessage(NON_HASH_MESSAGE), invalidSignature)).to.be.equals(false);
                });
            });

            describe('with v0 signature', function () {
                it('returns false with 00 as version value', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    const version = '00';
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await ecdsa.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature(erc1271walletV0.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    const [, r, s] = split3(signature);
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(signerV0, HASHED_TEST_MESSAGE, 0, r, s)).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(erc1271walletV0.address, HASHED_TEST_MESSAGE, 0, r, s)).to.be.equals(false);
                });

                it('returns true with 27 as version value, and only for signer', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await ecdsa.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(erc1271walletV0.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(account.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(signerV0, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(account.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature_r_vs(signerV0, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(true);
                    expect(await ecdsa.recoverOrIsValidSignature_r_vs(erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(true);
                    expect(await ecdsa.recoverOrIsValidSignature_r_vs(account.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(false);
                });

                it('returns false when wrong version', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    expect(await ecdsa.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, signatureWithoutVersionV0 + '02')).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature(erc1271walletV0.address, HASHED_TEST_MESSAGE, signatureWithoutVersionV0 + '02')).to.be.equals(false);
                    const [, r, s] = split3(signatureWithoutVersionV0 + '00');
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(signerV0, HASHED_TEST_MESSAGE, 2, r, s)).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(erc1271walletV0.address, HASHED_TEST_MESSAGE, 2, r, s)).to.be.equals(false);
                });

                it('returns true with short EIP2098 format, and only for signer', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await ecdsa.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(erc1271walletV0.address, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(account.address, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(erc1271walletV0.address, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(account.address, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(false);
                });
            });

            describe('with v1 signature', function () {
                it('returns false with 01 as version value', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    const version = '01';
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await ecdsa.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature(erc1271walletV1.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    const [, r, s] = split3(signature);
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(signerV1, HASHED_TEST_MESSAGE, 1, r, s)).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(erc1271walletV1.address, HASHED_TEST_MESSAGE, 1, r, s)).to.be.equals(false);
                });

                it('returns true with 28 as version value, and only for signer', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    const version = '1c'; // 28 = 1c.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await ecdsa.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(erc1271walletV1.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(account.address, HASHED_TEST_MESSAGE, signature)).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(signerV1, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(account.address, HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature_r_vs(signerV1, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(true);
                    expect(await ecdsa.recoverOrIsValidSignature_r_vs(erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(true);
                    expect(await ecdsa.recoverOrIsValidSignature_r_vs(account.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(false);
                });

                it('returns false when wrong version', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    expect(await ecdsa.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, signatureWithoutVersionV1 + '02')).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature(erc1271walletV1.address, HASHED_TEST_MESSAGE, signatureWithoutVersionV1 + '02')).to.be.equals(false);
                    const [, r, s] = split3(signatureWithoutVersionV1 + '01');
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(signerV1, HASHED_TEST_MESSAGE, 2, r, s)).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature_v_r_s(erc1271walletV1.address, HASHED_TEST_MESSAGE, 2, r, s)).to.be.equals(false);
                });

                it('returns true with short EIP2098 format, and only for signer', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    const version = '1c'; // 27 = 1b.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await ecdsa.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(erc1271walletV1.address, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(account.address, HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(erc1271walletV1.address, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature(account.address, HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature)))).to.be.equals(false);
                });
            });

            describe('recoverOrIsValidSignature65', async () => {
                it('with matching signer and signature', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(await ecdsa.recoverOrIsValidSignature65(account.address, HASHED_TEST_MESSAGE, ...split2(signature))).to.be.equals(true);
                    expect(await ecdsa.recoverOrIsValidSignature65(erc1271wallet.address, HASHED_TEST_MESSAGE, ...split2(signature))).to.be.equals(true);
                });

                it('with invalid signer', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(await ecdsa.recoverOrIsValidSignature65(randomAccount.address, HASHED_TEST_MESSAGE, ...split2(signature))).to.be.equals(false);
                });

                it('with invalid signature', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    const HASHED_WRONG_MESSAGE = ethers.utils.hashMessage(WRONG_MESSAGE);
                    expect(await ecdsa.recoverOrIsValidSignature65(account.address, HASHED_WRONG_MESSAGE, ...split2(signature))).to.be.equals(false);
                    expect(await ecdsa.recoverOrIsValidSignature65(erc1271wallet.address, HASHED_WRONG_MESSAGE, ...split2(signature))).to.be.equals(false);
                });
            });
        });
    });

    describe('toEthSignedMessageHash', async () => {
        it('correct hash', async function () {
            const { ecdsa } = await loadFixture(deployContracts);
            const hashedTestMessageWithoutPrefix = HASHED_TEST_MESSAGE.substring(2);
            const msg = concat([
                ethers.utils.toUtf8Bytes('\x19Ethereum Signed Message:\n'),
                ethers.utils.toUtf8Bytes(String(hashedTestMessageWithoutPrefix.length / 2)),
                arrayify(hashedTestMessageWithoutPrefix, { allowMissingPrefix: true }),
            ]);
            const ethSignedMessage = ethers.utils.keccak256(msg);
            expect(await ecdsa.toEthSignedMessageHash(HASHED_TEST_MESSAGE)).to.be.equals(ethSignedMessage);
        });
    });

    describe('toTypedDataHash', async () => {
        it('correct hash', async function () {
            const { ecdsa } = await loadFixture(deployContracts);
            const domainSeparator = HASHED_TEST_MESSAGE.substring(2);
            const structHash = HASHED_TEST_MESSAGE.substring(2);
            const typedDataHash = ethers.utils.keccak256(concat([
                ethers.utils.toUtf8Bytes('\x19\x01'),
                arrayify(domainSeparator, { allowMissingPrefix: true }),
                arrayify(String(structHash), { allowMissingPrefix: true }),
            ]));
            expect(await ecdsa.toTypedDataHash(HASHED_TEST_MESSAGE, HASHED_TEST_MESSAGE)).to.be.equals(typedDataHash);
        });
    });

    describe('gas price', async () => {
        describe('recover', async () => {
            it('with signature', async function () {
                const { ecdsa } = await loadFixture(deployContracts);
                const signature = await account.signMessage(TEST_MESSAGE);
                await account.sendTransaction(await ecdsa.populateTransaction.recover(HASHED_TEST_MESSAGE, signature));
            });

            it('with v0 signature', async () => {
                const { ecdsa } = await loadFixture(deployContracts);
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await account.sendTransaction(await ecdsa.populateTransaction.recover(HASHED_TEST_MESSAGE, signature));
                await account.sendTransaction(await ecdsa.populateTransaction.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature)));
                await account.sendTransaction(await ecdsa.populateTransaction.recover_r_vs(HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))));
            });

            it('with v1 signature', async () => {
                const { ecdsa } = await loadFixture(deployContracts);
                const version = '1c'; // 28 = 1c.
                const signature = signatureWithoutVersionV1 + version;
                await account.sendTransaction(await ecdsa.populateTransaction.recover(HASHED_TEST_MESSAGE, signature));
                await account.sendTransaction(await ecdsa.populateTransaction.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature)));
                await account.sendTransaction(await ecdsa.populateTransaction.recover_r_vs(HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))));
            });
        });

        describe('recoverOrIsValidSignature', async () => {
            it('with signature', async function () {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                const signature = await account.signMessage(TEST_MESSAGE);
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature(account.address, HASHED_TEST_MESSAGE, signature));
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature(erc1271wallet.address, HASHED_TEST_MESSAGE, signature));
            });

            it('with v0 signature', async () => {
                const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, signature));
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature(erc1271walletV0.address, HASHED_TEST_MESSAGE, signature));
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature_v_r_s(signerV0, HASHED_TEST_MESSAGE, ...split3(signature)));
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature_v_r_s(erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split3(signature)));
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature_r_vs(signerV0, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))));
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature_r_vs(erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))));
            });

            it('with v1 signature', async () => {
                const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, signature));
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature(erc1271walletV1.address, HASHED_TEST_MESSAGE, signature));
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature_v_r_s(signerV1, HASHED_TEST_MESSAGE, ...split3(signature)));
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature_v_r_s(erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split3(signature)));
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature_r_vs(signerV1, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))));
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature_r_vs(erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))));
            });

            it('recoverOrIsValidSignature65', async () => {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                const signature = await account.signMessage(TEST_MESSAGE);
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature65(account.address, HASHED_TEST_MESSAGE, ...split2(signature)));
                await account.sendTransaction(await ecdsa.populateTransaction.recoverOrIsValidSignature65(erc1271wallet.address, HASHED_TEST_MESSAGE, ...split2(signature)));
            });
        });

        describe('isValidSignature', async () => {
            it('with signature', async function () {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                const signature = await account.signMessage(TEST_MESSAGE);
                await account.sendTransaction(await ecdsa.populateTransaction.isValidSignature(erc1271wallet.address, HASHED_TEST_MESSAGE, signature));
            });

            it('with v0 signature', async () => {
                const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await account.sendTransaction(await ecdsa.populateTransaction.isValidSignature(erc1271walletV0.address, HASHED_TEST_MESSAGE, signature));
                await account.sendTransaction(await ecdsa.populateTransaction.isValidSignature_v_r_s(erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split3(signature)));
                await account.sendTransaction(await ecdsa.populateTransaction.isValidSignature_r_vs(erc1271walletV0.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))));
            });

            it('with v1 signature', async () => {
                const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await account.sendTransaction(await ecdsa.populateTransaction.isValidSignature(erc1271walletV1.address, HASHED_TEST_MESSAGE, signature));
                await account.sendTransaction(await ecdsa.populateTransaction.isValidSignature_v_r_s(erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split3(signature)));
                await account.sendTransaction(await ecdsa.populateTransaction.isValidSignature_r_vs(erc1271walletV1.address, HASHED_TEST_MESSAGE, ...split2(to2098Format(signature))));
            });

            it('isValidSignature65', async () => {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                const signature = await account.signMessage(TEST_MESSAGE);
                await account.sendTransaction(await ecdsa.populateTransaction.isValidSignature65(erc1271wallet.address, HASHED_TEST_MESSAGE, ...split2(signature)));
            });
        });

        describe('Additional methods', async () => {
            it('toEthSignedMessageHash', async function () {
                const { ecdsa } = await loadFixture(deployContracts);
                await account.sendTransaction(await ecdsa.populateTransaction.toEthSignedMessageHash(HASHED_TEST_MESSAGE));
            });

            it('toTypedDataHash', async function () {
                const { ecdsa } = await loadFixture(deployContracts);
                await account.sendTransaction(await ecdsa.populateTransaction.toTypedDataHash(HASHED_TEST_MESSAGE, HASHED_TEST_MESSAGE));
            });
        });
    });
});
