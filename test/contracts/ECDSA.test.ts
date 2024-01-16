import { constants } from '../../src/prelude';
import { expect } from '../../src/expect';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { getBytes, concat, Signature, hashMessage, HDNodeWallet, keccak256, toUtf8Bytes } from 'ethers';

describe('ECDSA', function () {
    let account: SignerWithAddress;
    let randomAccount: HDNodeWallet;

    before(async function () {
        [account] = await ethers.getSigners();
        randomAccount = await ethers.Wallet.createRandom();
    });

    async function deployContracts() {
        const ECDSATest = await ethers.getContractFactory('ECDSATest');
        const ecdsa = await ECDSATest.deploy();
        const ERC1271WalletMock = await ethers.getContractFactory('ERC1271WalletMock');
        const erc1271wallet = await ERC1271WalletMock.deploy(account);
        const erc1271walletV0 = await ERC1271WalletMock.deploy(signerV0);
        const erc1271walletV1 = await ERC1271WalletMock.deploy(signerV1);

        return { ecdsa, erc1271wallet, erc1271walletV0, erc1271walletV1 };
    }

    const TEST_MESSAGE = '1inch-ecdsa-asm-library';
    const HASHED_TEST_MESSAGE = hashMessage('1inch-ecdsa-asm-library');
    const WRONG_MESSAGE = keccak256(toUtf8Bytes('Nope'));
    const NON_HASH_MESSAGE = getBytes('0x' + Buffer.from('abcd').toString('hex'));

    function split2(signature: string): [string, string] {
        const sig =  Signature.from(signature);
        return [sig.r, sig.yParityAndS];
    }

    function split3(signature: string): [string, string, string] {
        const { v, r, s } = Signature.from(signature);
        return [v.toString(), r, s];
    }

    function to2098Format(signature: string): string {
        return Signature.from(signature).compactSerialized;
    }

    function from2098Format(signature: string): string {
        const { v, r, s } = Signature.from(signature);
        const ret = concat([r, s, getBytes('0x' + v.toString(16))]);
        return ret;
    }

    // eslint-disable-next-line max-len
    const longSignature =
        '0x01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789';

    // Signature generated outside ganache
    const signerV0 = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    // eslint-disable-next-line max-len
    const signatureWithoutVersionV0 =
        '0x064d3d0f049cc3b971476ba4bdbd5d0ccb5ac0ee7a03c2f063908ac2bdb59f944c7c5bf43804a7ff717f8c0a8749e0e5cb26ef96408313558acd130210604d9c';
    const signerV1 = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
    // eslint-disable-next-line max-len
    const signatureWithoutVersionV1 =
        '0x7bf43cd41b0fe2edad48ab66d2bc8e78d4aad37d0cf77e9fa4668560e1eac68277c325f777b8ee2f9d522c635c252bfdba6ba261edbf53c46c64d47824f2a009';
    // eslint-disable-next-line max-len
    const invalidSignature =
        '0x332ce75a821c982f9127538858900d87d3ec1f9f737338ad67cad133fa48feff48e6fa0c18abc62e42820f05943e47af3e9fbe306ce74d64094bdf1691ee53e01c';

    describe('recover', function () {
        describe('with invalid signature', function () {
            it('with short signature', async function () {
                const { ecdsa } = await loadFixture(deployContracts);
                expect(await ecdsa.recover(HASHED_TEST_MESSAGE, '0x1234')).to.be.equals(constants.ZERO_ADDRESS);
            });

            it('with long signature', async function () {
                const { ecdsa } = await loadFixture(deployContracts);
                expect(await ecdsa.recover(HASHED_TEST_MESSAGE, longSignature)).to.be.equals(constants.ZERO_ADDRESS);
            });
        });

        describe('with valid signature', function () {
            describe('using account.signMessage', function () {
                it('returns signer address with correct signature', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(account.address);
                });

                it('returns signer address with correct signature for arbitrary length message', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(NON_HASH_MESSAGE);
                    expect(await ecdsa.recover(hashMessage(NON_HASH_MESSAGE), signature)).to.be.equals(account.address);
                });

                it('returns a different address', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(await ecdsa.recover(WRONG_MESSAGE, signature)).to.be.not.equals(account.address);
                });

                it('returns zero address with invalid signature', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, invalidSignature)).to.be.equals(
                        constants.ZERO_ADDRESS,
                    );
                });
            });

            describe('with v0 signature', function () {
                it('returns zero address with 00 as version value', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const version = '00';
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(constants.ZERO_ADDRESS);
                    const [, r, s] = split3(signature);
                    expect(await ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, 0, r, s)).to.be.equals(
                        constants.ZERO_ADDRESS,
                    );
                });

                it('works with 27 as version value', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(signerV0);
                    expect(await ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(signerV0);
                    expect(await ecdsa.recover_r_vs(HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(
                        signerV0,
                    );
                });

                it('returns zero address when wrong version', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signatureWithoutVersionV0 + '02')).to.be.equals(
                        constants.ZERO_ADDRESS,
                    );
                    const [, r, s] = split3(signatureWithoutVersionV0 + '00');
                    expect(await ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, 2, r, s)).to.be.equals(
                        constants.ZERO_ADDRESS,
                    );
                });

                it('works with short EIP2098 format', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(signerV0);
                    expect(
                        await ecdsa.recover(HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature))),
                    ).to.be.equals(signerV0);
                });
            });

            describe('with v1 signature', function () {
                it('returns zero address with 01 as version value', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const version = '01';
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(constants.ZERO_ADDRESS);
                    const [, r, s] = split3(signature);
                    expect(await ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, 1, r, s)).to.be.equals(
                        constants.ZERO_ADDRESS,
                    );
                });

                it('works with 28 as version value', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const version = '1c'; // 28 = 1c.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signature)).to.be.equals(signerV1);
                    expect(await ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, ...split3(signature))).to.be.equals(signerV1);
                    expect(await ecdsa.recover_r_vs(HASHED_TEST_MESSAGE, ...split2(to2098Format(signature)))).to.equal(
                        signerV1,
                    );
                });

                it('returns zero address when wrong version', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, signatureWithoutVersionV1 + '02')).to.be.equals(
                        constants.ZERO_ADDRESS,
                    );
                    const [, r, s] = split3(signatureWithoutVersionV1 + '01');
                    expect(await ecdsa.recover_v_r_s(HASHED_TEST_MESSAGE, 2, r, s)).to.be.equals(
                        constants.ZERO_ADDRESS,
                    );
                });

                it('works with short EIP2098 format', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const version = '1c'; // 27 = 1b.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(await ecdsa.recover(HASHED_TEST_MESSAGE, to2098Format(signature))).to.be.equals(signerV1);
                    expect(
                        await ecdsa.recover(HASHED_TEST_MESSAGE, from2098Format(to2098Format(signature))),
                    ).to.be.equals(signerV1);
                });
            });
        });
    });

    describe('isValidSignature', function () {
        describe('with invalid signature', function () {
            it('with short signature', async function () {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                expect(await ecdsa.isValidSignature(erc1271wallet, HASHED_TEST_MESSAGE, '0x1234')).to.be.equals(
                    false,
                );
            });

            it('with long signature', async function () {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                expect(
                    await ecdsa.isValidSignature(erc1271wallet, HASHED_TEST_MESSAGE, longSignature),
                ).to.be.false;
            });
        });

        describe('with valid signature', function () {
            describe('using account.signMesage', function () {
                it('returns true with correct signature and only correct signer', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(
                        await ecdsa.isValidSignature(erc1271wallet, HASHED_TEST_MESSAGE, signature),
                    ).to.be.true;
                    expect(
                        await ecdsa.isValidSignature(randomAccount, HASHED_TEST_MESSAGE, signature),
                    ).to.be.false;
                });

                it('returns true with correct signature and only correct signer for arbitrary length message', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(NON_HASH_MESSAGE);
                    expect(
                        await ecdsa.isValidSignature(erc1271wallet, hashMessage(NON_HASH_MESSAGE), signature),
                    ).to.be.true;
                    expect(
                        await ecdsa.isValidSignature(randomAccount, hashMessage(NON_HASH_MESSAGE), signature),
                    ).to.be.false;
                });

                it('returns false with invalid signature', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    expect(
                        await ecdsa.isValidSignature(
                            erc1271wallet,
                            hashMessage(NON_HASH_MESSAGE),
                            invalidSignature,
                        ),
                    ).to.be.false;
                });
            });

            describe('with v0 signature', function () {
                it('returns false with 00 as version value', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    const version = '00';
                    const signature = signatureWithoutVersionV0 + version;
                    expect(
                        await ecdsa.isValidSignature(erc1271walletV0, HASHED_TEST_MESSAGE, signature),
                    ).to.be.false;
                    const [, r, s] = split3(signature);
                    expect(
                        await ecdsa.isValidSignature_v_r_s(erc1271walletV0, HASHED_TEST_MESSAGE, 0, r, s),
                    ).to.be.false;
                });

                it('returns true with 27 as version value, and only for signer', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(
                        await ecdsa.isValidSignature(erc1271walletV0, HASHED_TEST_MESSAGE, signature),
                    ).to.be.true;
                    expect(await ecdsa.isValidSignature(account, HASHED_TEST_MESSAGE, signature)).to.be.equals(
                        false,
                    );
                    expect(
                        await ecdsa.isValidSignature_v_r_s(
                            erc1271walletV0,
                            HASHED_TEST_MESSAGE,
                            ...split3(signature),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.isValidSignature_v_r_s(account, HASHED_TEST_MESSAGE, ...split3(signature)),
                    ).to.be.false;
                    expect(
                        await ecdsa.isValidSignature_r_vs(
                            erc1271walletV0,
                            HASHED_TEST_MESSAGE,
                            ...split2(to2098Format(signature)),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.isValidSignature_r_vs(
                            account,
                            HASHED_TEST_MESSAGE,
                            ...split2(to2098Format(signature)),
                        ),
                    ).to.be.false;
                });

                it('returns false when wrong version', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    expect(
                        await ecdsa.isValidSignature(
                            erc1271walletV0,
                            HASHED_TEST_MESSAGE,
                            signatureWithoutVersionV0 + '02',
                        ),
                    ).to.be.false;
                    const [, r, s] = split3(signatureWithoutVersionV1 + '01');
                    expect(
                        await ecdsa.isValidSignature_v_r_s(erc1271walletV0, HASHED_TEST_MESSAGE, 2, r, s),
                    ).to.be.false;
                });

                it('returns true with short EIP2098 format, and only for signer', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(
                        await ecdsa.isValidSignature(
                            erc1271walletV0,
                            HASHED_TEST_MESSAGE,
                            to2098Format(signature),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.isValidSignature(account, HASHED_TEST_MESSAGE, to2098Format(signature)),
                    ).to.be.false;
                    expect(
                        await ecdsa.isValidSignature(
                            erc1271walletV0,
                            HASHED_TEST_MESSAGE,
                            from2098Format(to2098Format(signature)),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.isValidSignature(
                            account,
                            HASHED_TEST_MESSAGE,
                            from2098Format(to2098Format(signature)),
                        ),
                    ).to.be.false;
                });
            });

            describe('with v1 signature', function () {
                it('returns false with 01 as version value', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    expect(
                        await ecdsa.isValidSignature(
                            erc1271walletV1,
                            HASHED_TEST_MESSAGE,
                            signatureWithoutVersionV1 + '01',
                        ),
                    ).to.be.false;
                    const [, r, s] = split3(signatureWithoutVersionV1 + '01');
                    expect(
                        await ecdsa.isValidSignature_v_r_s(erc1271walletV1, HASHED_TEST_MESSAGE, 1, r, s),
                    ).to.be.false;
                });

                it('returns true with 28 as version value, and only for signer', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    const version = '1c'; // 28 = 1c.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(
                        await ecdsa.isValidSignature(erc1271walletV1, HASHED_TEST_MESSAGE, signature),
                    ).to.be.true;
                    expect(await ecdsa.isValidSignature(account, HASHED_TEST_MESSAGE, signature)).to.be.equals(
                        false,
                    );
                    expect(
                        await ecdsa.isValidSignature_v_r_s(
                            erc1271walletV1,
                            HASHED_TEST_MESSAGE,
                            ...split3(signature),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.isValidSignature_v_r_s(account, HASHED_TEST_MESSAGE, ...split3(signature)),
                    ).to.be.false;
                    expect(
                        await ecdsa.isValidSignature_r_vs(
                            erc1271walletV1,
                            HASHED_TEST_MESSAGE,
                            ...split2(to2098Format(signature)),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.isValidSignature_r_vs(
                            account,
                            HASHED_TEST_MESSAGE,
                            ...split2(to2098Format(signature)),
                        ),
                    ).to.be.false;
                });

                it('returns false when wrong version', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    expect(
                        await ecdsa.isValidSignature(
                            erc1271walletV1,
                            HASHED_TEST_MESSAGE,
                            signatureWithoutVersionV1 + '02',
                        ),
                    ).to.be.false;
                    const [, r, s] = split3(signatureWithoutVersionV1 + '01');
                    expect(
                        await ecdsa.isValidSignature_v_r_s(erc1271walletV1, HASHED_TEST_MESSAGE, 2, r, s),
                    ).to.be.false;
                });

                it('returns true with short EIP2098 format, and only for signer', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    const version = '1c'; // 27 = 1b.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(
                        await ecdsa.isValidSignature(
                            erc1271walletV1,
                            HASHED_TEST_MESSAGE,
                            to2098Format(signature),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.isValidSignature(account, HASHED_TEST_MESSAGE, to2098Format(signature)),
                    ).to.be.false;
                    expect(
                        await ecdsa.isValidSignature(
                            erc1271walletV1,
                            HASHED_TEST_MESSAGE,
                            from2098Format(to2098Format(signature)),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.isValidSignature(
                            account,
                            HASHED_TEST_MESSAGE,
                            from2098Format(to2098Format(signature)),
                        ),
                    ).to.be.false;
                });
            });

            describe('isValidSignature65', function () {
                it('with matching signer and signature', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(
                        await ecdsa.isValidSignature65(
                            erc1271wallet,
                            HASHED_TEST_MESSAGE,
                            ...split2(signature),
                        ),
                    ).to.be.true;
                });

                it('with invalid signer', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(
                        await ecdsa.isValidSignature65(
                            randomAccount,
                            HASHED_TEST_MESSAGE,
                            ...split2(signature),
                        ),
                    ).to.be.false;
                });

                it('with invalid signature', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    const HASHED_WRONG_MESSAGE = hashMessage(WRONG_MESSAGE);
                    expect(
                        await ecdsa.isValidSignature65(
                            erc1271wallet,
                            HASHED_WRONG_MESSAGE,
                            ...split2(signature),
                        ),
                    ).to.be.false;
                });
            });
        });
    });

    describe('recoverOrIsValidSignature', function () {
        describe('with invalid signature', function () {
            it('with short signature', async function () {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                expect(
                    await ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, '0x1234'),
                ).to.be.false;
                expect(
                    await ecdsa.recoverOrIsValidSignature(erc1271wallet, HASHED_TEST_MESSAGE, '0x1234'),
                ).to.be.false;
            });

            it('with long signature', async function () {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                expect(
                    await ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, longSignature),
                ).to.be.false;
                expect(
                    await ecdsa.recoverOrIsValidSignature(erc1271wallet, HASHED_TEST_MESSAGE, longSignature),
                ).to.be.false;
            });
        });

        describe('with valid signature', function () {
            describe('using account.signMessage', function () {
                it('returns true with correct signature and only correct signer', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(
                        await ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, signature),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(randomAccount, HASHED_TEST_MESSAGE, signature),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(erc1271wallet, HASHED_TEST_MESSAGE, signature),
                    ).to.be.true;
                });

                it('returns true with correct signature and only correct signer for arbitrary length message', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(NON_HASH_MESSAGE);
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            account,
                            hashMessage(NON_HASH_MESSAGE),
                            signature,
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            randomAccount,
                            hashMessage(NON_HASH_MESSAGE),
                            signature,
                        ),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            erc1271wallet,
                            hashMessage(NON_HASH_MESSAGE),
                            signature,
                        ),
                    ).to.be.true;
                });

                it('returns false with invalid signature', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            account,
                            hashMessage(NON_HASH_MESSAGE),
                            invalidSignature,
                        ),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            erc1271wallet,
                            hashMessage(NON_HASH_MESSAGE),
                            invalidSignature,
                        ),
                    ).to.be.false;
                });
            });

            describe('with v0 signature', function () {
                it('returns false with 00 as version value', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    const version = '00';
                    const signature = signatureWithoutVersionV0 + version;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, signature),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(erc1271walletV0, HASHED_TEST_MESSAGE, signature),
                    ).to.be.false;
                    const [, r, s] = split3(signature);
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(signerV0, HASHED_TEST_MESSAGE, 0, r, s),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(
                            erc1271walletV0,
                            HASHED_TEST_MESSAGE,
                            0,
                            r,
                            s,
                        ),
                    ).to.be.false;
                });

                it('returns true with 27 as version value, and only for signer', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, signature),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(erc1271walletV0, HASHED_TEST_MESSAGE, signature),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, signature),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(
                            signerV0,
                            HASHED_TEST_MESSAGE,
                            ...split3(signature),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(
                            erc1271walletV0,
                            HASHED_TEST_MESSAGE,
                            ...split3(signature),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(
                            account,
                            HASHED_TEST_MESSAGE,
                            ...split3(signature),
                        ),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_r_vs(
                            signerV0,
                            HASHED_TEST_MESSAGE,
                            ...split2(to2098Format(signature)),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_r_vs(
                            erc1271walletV0,
                            HASHED_TEST_MESSAGE,
                            ...split2(to2098Format(signature)),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_r_vs(
                            account,
                            HASHED_TEST_MESSAGE,
                            ...split2(to2098Format(signature)),
                        ),
                    ).to.be.false;
                });

                it('returns false when wrong version', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            signerV0,
                            HASHED_TEST_MESSAGE,
                            signatureWithoutVersionV0 + '02',
                        ),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            erc1271walletV0,
                            HASHED_TEST_MESSAGE,
                            signatureWithoutVersionV0 + '02',
                        ),
                    ).to.be.false;
                    const [, r, s] = split3(signatureWithoutVersionV0 + '00');
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(signerV0, HASHED_TEST_MESSAGE, 2, r, s),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(
                            erc1271walletV0,
                            HASHED_TEST_MESSAGE,
                            2,
                            r,
                            s,
                        ),
                    ).to.be.false;
                });

                it('returns true with short EIP2098 format, and only for signer', async function () {
                    const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                    const version = '1b'; // 27 = 1b.
                    const signature = signatureWithoutVersionV0 + version;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(signerV0, HASHED_TEST_MESSAGE, to2098Format(signature)),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            erc1271walletV0,
                            HASHED_TEST_MESSAGE,
                            to2098Format(signature),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            account,
                            HASHED_TEST_MESSAGE,
                            to2098Format(signature),
                        ),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            signerV0,
                            HASHED_TEST_MESSAGE,
                            from2098Format(to2098Format(signature)),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            erc1271walletV0,
                            HASHED_TEST_MESSAGE,
                            from2098Format(to2098Format(signature)),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            account,
                            HASHED_TEST_MESSAGE,
                            from2098Format(to2098Format(signature)),
                        ),
                    ).to.be.false;
                });
            });

            describe('with v1 signature', function () {
                it('returns false with 01 as version value', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    const version = '01';
                    const signature = signatureWithoutVersionV1 + version;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, signature),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(erc1271walletV1, HASHED_TEST_MESSAGE, signature),
                    ).to.be.false;
                    const [, r, s] = split3(signature);
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(signerV1, HASHED_TEST_MESSAGE, 1, r, s),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(
                            erc1271walletV1,
                            HASHED_TEST_MESSAGE,
                            1,
                            r,
                            s,
                        ),
                    ).to.be.false;
                });

                it('returns true with 28 as version value, and only for signer', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    const version = '1c'; // 28 = 1c.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, signature),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(erc1271walletV1, HASHED_TEST_MESSAGE, signature),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(account, HASHED_TEST_MESSAGE, signature),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(
                            signerV1,
                            HASHED_TEST_MESSAGE,
                            ...split3(signature),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(
                            erc1271walletV1,
                            HASHED_TEST_MESSAGE,
                            ...split3(signature),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(
                            account,
                            HASHED_TEST_MESSAGE,
                            ...split3(signature),
                        ),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_r_vs(
                            signerV1,
                            HASHED_TEST_MESSAGE,
                            ...split2(to2098Format(signature)),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_r_vs(
                            erc1271walletV1,
                            HASHED_TEST_MESSAGE,
                            ...split2(to2098Format(signature)),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_r_vs(
                            account,
                            HASHED_TEST_MESSAGE,
                            ...split2(to2098Format(signature)),
                        ),
                    ).to.be.false;
                });

                it('returns false when wrong version', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    // The last two hex digits are the signature version.
                    // The only valid values are 0, 1, 27 and 28.
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            signerV1,
                            HASHED_TEST_MESSAGE,
                            signatureWithoutVersionV1 + '02',
                        ),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            erc1271walletV1,
                            HASHED_TEST_MESSAGE,
                            signatureWithoutVersionV1 + '02',
                        ),
                    ).to.be.false;
                    const [, r, s] = split3(signatureWithoutVersionV1 + '01');
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(signerV1, HASHED_TEST_MESSAGE, 2, r, s),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature_v_r_s(
                            erc1271walletV1,
                            HASHED_TEST_MESSAGE,
                            2,
                            r,
                            s,
                        ),
                    ).to.be.false;
                });

                it('returns true with short EIP2098 format, and only for signer', async function () {
                    const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                    const version = '1c'; // 27 = 1b.
                    const signature = signatureWithoutVersionV1 + version;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(signerV1, HASHED_TEST_MESSAGE, to2098Format(signature)),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            erc1271walletV1,
                            HASHED_TEST_MESSAGE,
                            to2098Format(signature),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            account,
                            HASHED_TEST_MESSAGE,
                            to2098Format(signature),
                        ),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            signerV1,
                            HASHED_TEST_MESSAGE,
                            from2098Format(to2098Format(signature)),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            erc1271walletV1,
                            HASHED_TEST_MESSAGE,
                            from2098Format(to2098Format(signature)),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature(
                            account,
                            HASHED_TEST_MESSAGE,
                            from2098Format(to2098Format(signature)),
                        ),
                    ).to.be.false;
                });
            });

            describe('recoverOrIsValidSignature65', function () {
                it('with matching signer and signature', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(
                        await ecdsa.recoverOrIsValidSignature65(
                            account,
                            HASHED_TEST_MESSAGE,
                            ...split2(signature),
                        ),
                    ).to.be.true;
                    expect(
                        await ecdsa.recoverOrIsValidSignature65(
                            erc1271wallet,
                            HASHED_TEST_MESSAGE,
                            ...split2(signature),
                        ),
                    ).to.be.true;
                });

                it('with invalid signer', async function () {
                    const { ecdsa } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    expect(
                        await ecdsa.recoverOrIsValidSignature65(
                            randomAccount,
                            HASHED_TEST_MESSAGE,
                            ...split2(signature),
                        ),
                    ).to.be.false;
                });

                it('with invalid signature', async function () {
                    const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                    const signature = await account.signMessage(TEST_MESSAGE);
                    const HASHED_WRONG_MESSAGE = hashMessage(WRONG_MESSAGE);
                    expect(
                        await ecdsa.recoverOrIsValidSignature65(
                            account,
                            HASHED_WRONG_MESSAGE,
                            ...split2(signature),
                        ),
                    ).to.be.false;
                    expect(
                        await ecdsa.recoverOrIsValidSignature65(
                            erc1271wallet,
                            HASHED_WRONG_MESSAGE,
                            ...split2(signature),
                        ),
                    ).to.be.false;
                });
            });
        });
    });

    describe('toEthSignedMessageHash', function () {
        it('correct hash', async function () {
            const { ecdsa } = await loadFixture(deployContracts);
            const hashedTestMessageWithoutPrefix = HASHED_TEST_MESSAGE.substring(2);
            const msg = concat([
                toUtf8Bytes('\x19Ethereum Signed Message:\n'),
                toUtf8Bytes(String(hashedTestMessageWithoutPrefix.length / 2)),
                getBytes(HASHED_TEST_MESSAGE),
            ]);
            const ethSignedMessage = keccak256(msg);
            expect(await ecdsa.toEthSignedMessageHash(HASHED_TEST_MESSAGE)).to.be.equals(ethSignedMessage);
        });
    });

    describe('toTypedDataHash', function () {
        it('correct hash', async function () {
            const { ecdsa } = await loadFixture(deployContracts);
            const domainSeparator = HASHED_TEST_MESSAGE;
            const structHash = HASHED_TEST_MESSAGE;
            const typedDataHash = keccak256(
                concat([
                    toUtf8Bytes('\x19\x01'),
                    getBytes(domainSeparator),
                    getBytes(structHash),
                ]),
            );
            expect(await ecdsa.toTypedDataHash(HASHED_TEST_MESSAGE, HASHED_TEST_MESSAGE)).to.be.equals(typedDataHash);
        });
    });

    describe('gas price', function () {
        describe('recover', function () {
            it('with signature', async function () {
                const { ecdsa } = await loadFixture(deployContracts);
                const signature = await account.signMessage(TEST_MESSAGE);
                await account.sendTransaction(await ecdsa.recover.populateTransaction(HASHED_TEST_MESSAGE, signature));
            });

            it('with v0 signature', async function () {
                const { ecdsa } = await loadFixture(deployContracts);
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await account.sendTransaction(await ecdsa.recover.populateTransaction(HASHED_TEST_MESSAGE, signature));
                await account.sendTransaction(
                    await ecdsa.recover_v_r_s.populateTransaction(HASHED_TEST_MESSAGE, ...split3(signature)),
                );
                await account.sendTransaction(
                    await ecdsa.recover_r_vs.populateTransaction(
                        HASHED_TEST_MESSAGE,
                        ...split2(to2098Format(signature)),
                    ),
                );
            });

            it('with v1 signature', async function () {
                const { ecdsa } = await loadFixture(deployContracts);
                const version = '1c'; // 28 = 1c.
                const signature = signatureWithoutVersionV1 + version;
                await account.sendTransaction(await ecdsa.recover.populateTransaction(HASHED_TEST_MESSAGE, signature));
                await account.sendTransaction(
                    await ecdsa.recover_v_r_s.populateTransaction(HASHED_TEST_MESSAGE, ...split3(signature)),
                );
                await account.sendTransaction(
                    await ecdsa.recover_r_vs.populateTransaction(
                        HASHED_TEST_MESSAGE,
                        ...split2(to2098Format(signature)),
                    ),
                );
            });
        });

        describe('recoverOrIsValidSignature', function () {
            it('with signature', async function () {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                const signature = await account.signMessage(TEST_MESSAGE);
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature.populateTransaction(
                        account,
                        HASHED_TEST_MESSAGE,
                        signature,
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature.populateTransaction(
                        erc1271wallet,
                        HASHED_TEST_MESSAGE,
                        signature,
                    ),
                );
            });

            it('with v0 signature', async function () {
                const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature.populateTransaction(signerV0, HASHED_TEST_MESSAGE, signature),
                );
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature.populateTransaction(
                        erc1271walletV0,
                        HASHED_TEST_MESSAGE,
                        signature,
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature_v_r_s.populateTransaction(
                        signerV0,
                        HASHED_TEST_MESSAGE,
                        ...split3(signature),
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature_v_r_s.populateTransaction(
                        erc1271walletV0,
                        HASHED_TEST_MESSAGE,
                        ...split3(signature),
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature_r_vs.populateTransaction(
                        signerV0,
                        HASHED_TEST_MESSAGE,
                        ...split2(to2098Format(signature)),
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature_r_vs.populateTransaction(
                        erc1271walletV0,
                        HASHED_TEST_MESSAGE,
                        ...split2(to2098Format(signature)),
                    ),
                );
            });

            it('with v1 signature', async function () {
                const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature.populateTransaction(signerV1, HASHED_TEST_MESSAGE, signature),
                );
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature.populateTransaction(
                        erc1271walletV1,
                        HASHED_TEST_MESSAGE,
                        signature,
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature_v_r_s.populateTransaction(
                        signerV1,
                        HASHED_TEST_MESSAGE,
                        ...split3(signature),
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature_v_r_s.populateTransaction(
                        erc1271walletV1,
                        HASHED_TEST_MESSAGE,
                        ...split3(signature),
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature_r_vs.populateTransaction(
                        signerV1,
                        HASHED_TEST_MESSAGE,
                        ...split2(to2098Format(signature)),
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature_r_vs.populateTransaction(
                        erc1271walletV1,
                        HASHED_TEST_MESSAGE,
                        ...split2(to2098Format(signature)),
                    ),
                );
            });

            it('recoverOrIsValidSignature65', async function () {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                const signature = await account.signMessage(TEST_MESSAGE);
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature65.populateTransaction(
                        account,
                        HASHED_TEST_MESSAGE,
                        ...split2(signature),
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.recoverOrIsValidSignature65.populateTransaction(
                        erc1271wallet,
                        HASHED_TEST_MESSAGE,
                        ...split2(signature),
                    ),
                );
            });
        });

        describe('isValidSignature', function () {
            it('with signature', async function () {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                const signature = await account.signMessage(TEST_MESSAGE);
                await account.sendTransaction(
                    await ecdsa.isValidSignature.populateTransaction(
                        erc1271wallet,
                        HASHED_TEST_MESSAGE,
                        signature,
                    ),
                );
            });

            it('with v0 signature', async function () {
                const { ecdsa, erc1271walletV0 } = await loadFixture(deployContracts);
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await account.sendTransaction(
                    await ecdsa.isValidSignature.populateTransaction(
                        erc1271walletV0,
                        HASHED_TEST_MESSAGE,
                        signature,
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.isValidSignature_v_r_s.populateTransaction(
                        erc1271walletV0,
                        HASHED_TEST_MESSAGE,
                        ...split3(signature),
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.isValidSignature_r_vs.populateTransaction(
                        erc1271walletV0,
                        HASHED_TEST_MESSAGE,
                        ...split2(to2098Format(signature)),
                    ),
                );
            });

            it('with v1 signature', async function () {
                const { ecdsa, erc1271walletV1 } = await loadFixture(deployContracts);
                const version = '1b'; // 27 = 1b.
                const signature = signatureWithoutVersionV0 + version;
                await account.sendTransaction(
                    await ecdsa.isValidSignature.populateTransaction(
                        erc1271walletV1,
                        HASHED_TEST_MESSAGE,
                        signature,
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.isValidSignature_v_r_s.populateTransaction(
                        erc1271walletV1,
                        HASHED_TEST_MESSAGE,
                        ...split3(signature),
                    ),
                );
                await account.sendTransaction(
                    await ecdsa.isValidSignature_r_vs.populateTransaction(
                        erc1271walletV1,
                        HASHED_TEST_MESSAGE,
                        ...split2(to2098Format(signature)),
                    ),
                );
            });

            it('isValidSignature65', async function () {
                const { ecdsa, erc1271wallet } = await loadFixture(deployContracts);
                const signature = await account.signMessage(TEST_MESSAGE);
                await account.sendTransaction(
                    await ecdsa.isValidSignature65.populateTransaction(
                        erc1271wallet,
                        HASHED_TEST_MESSAGE,
                        ...split2(signature),
                    ),
                );
            });
        });

        describe('Additional methods', function () {
            it('toEthSignedMessageHash', async function () {
                const { ecdsa } = await loadFixture(deployContracts);
                await account.sendTransaction(
                    await ecdsa.toEthSignedMessageHash.populateTransaction(HASHED_TEST_MESSAGE),
                );
            });

            it('toTypedDataHash', async function () {
                const { ecdsa } = await loadFixture(deployContracts);
                await account.sendTransaction(
                    await ecdsa.toTypedDataHash.populateTransaction(HASHED_TEST_MESSAGE, HASHED_TEST_MESSAGE),
                );
            });
        });
    });
});
