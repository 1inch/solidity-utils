import { ethers, loadFixture } from '../src/hardhatHelpers.js';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import { expect } from '../src/expect.js';
import { defaultDeadline, buildData, buildDataLikeDai, getPermit, getPermit2, getPermitLikeDai, getPermitLikeUSDC, permit2Contract, cutSelector } from '../src/permit.js';
import { constants } from '../src/prelude.js';
import { use } from 'chai';
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot';
import hre from 'hardhat';

if (!hre.globalOptions.coverage) {
    use(jestSnapshotPlugin());
}

const value = 42n;

describe('Permitable', function () {
    let signer1: HardhatEthersSigner;
    let signer2: HardhatEthersSigner;

    before(async function () {
        [signer1, signer2] = await ethers.getSigners();
    });

    async function deployTokens() {
        const PermitableMockFactory = await ethers.getContractFactory('PermitableMock');
        const ERC20PermitMockFactory = await ethers.getContractFactory('ERC20PermitMock');
        const DaiLikePermitMockFactory = await ethers.getContractFactory('DaiLikePermitMock');
        const USDCLikePermitMockFactory = await ethers.getContractFactory('USDCLikePermitMock');
        const SafeERC20Factory = await ethers.getContractFactory('SafeERC20');
        const IsValidSignatureMockFactory = await ethers.getContractFactory('ERC1271WalletMock');

        const chainId = Number((await ethers.provider.getNetwork()).chainId);
        const permitableMock = await PermitableMockFactory.deploy();
        const erc20PermitMock = await ERC20PermitMockFactory.deploy('USDC', 'USDC', signer1, 100n);
        const daiLikePermitMock = await DaiLikePermitMockFactory.deploy('DAI', 'DAI', signer1, 100n);
        const usdcLikePermitMock = await USDCLikePermitMockFactory.deploy('USDCP', 'USDCP', signer1, 100n);
        const safeERC20 = await SafeERC20Factory.attach(permitableMock);
        const isValidSignatureMock = await IsValidSignatureMockFactory.deploy(signer1);
        return { permitableMock, erc20PermitMock, daiLikePermitMock, usdcLikePermitMock, safeERC20, isValidSignatureMock, chainId };
    }

    it('should be permitted for IERC20Permit', async function () {
        const { permitableMock, erc20PermitMock, chainId } = await loadFixture(deployTokens);

        const permit = await getPermit(signer1, erc20PermitMock, '1', chainId, await permitableMock.getAddress(), value.toString());
        await permitableMock.mockPermit(erc20PermitMock, permit);
        expect(await erc20PermitMock.nonces(signer1)).to.be.equal('1');
        expect(await erc20PermitMock.allowance(signer1, permitableMock)).to.be.equal(value);
    });

    it('should be permitted for IERC20Permit (compact)', async function () {
        const { permitableMock, erc20PermitMock, chainId } = await loadFixture(deployTokens);

        const permit = await getPermit(signer1, erc20PermitMock, '1', chainId, await permitableMock.getAddress(), value.toString(), constants.MAX_UINT256.toString(), true);
        await permitableMock.mockPermitCompact(erc20PermitMock, permit);
        expect(await erc20PermitMock.nonces(signer1)).to.be.equal('1');
        expect(await erc20PermitMock.allowance(signer1, permitableMock)).to.be.equal(value);
    });

    it('should be permitted for IERC20Permit with deadline less than max int', async function () {
        const { permitableMock, erc20PermitMock, chainId } = await loadFixture(deployTokens);
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const deadline  = block ? block.timestamp + 1000 : 6421990892; // 03 Jul 2173 00:00:00 GMT+0000

        const permit = await getPermit(signer1, erc20PermitMock, '1', chainId, await permitableMock.getAddress(), value.toString(), deadline.toString());
        await permitableMock.mockPermit(erc20PermitMock, permit);
        expect(await erc20PermitMock.nonces(signer1)).to.be.equal('1');
        expect(await erc20PermitMock.allowance(signer1, permitableMock)).to.be.equal(value);
    });

    it('should be not permitted for IERC20Permit with deadline less than current block', async function () {
        const { permitableMock, erc20PermitMock, chainId } = await loadFixture(deployTokens);
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const deadline  = block ? block.timestamp - 1000 : 1000;

        const permit = await getPermit(signer1, erc20PermitMock, '1', chainId, await permitableMock.getAddress(), value.toString(), deadline.toString());
        await expect(permitableMock.mockPermit(erc20PermitMock, permit)).to.be.revertedWithCustomError(erc20PermitMock, 'ERC2612ExpiredSignature');
    });

    it('should not be permitted for IERC20Permit', async function () {
        const { permitableMock, erc20PermitMock, chainId } = await loadFixture(deployTokens);

        const name = await erc20PermitMock.name();
        const nonce = await erc20PermitMock.nonces(signer1);
        const data = buildData(
            name,
            '1',
            chainId,
            await erc20PermitMock.getAddress(),
            signer1.address,
            signer2.address,
            value.toString(),
            nonce.toString(),
        );
        const signature = await signer1.signTypedData(data.domain, data.types, data.message);
        const { v, r, s } = ethers.Signature.from(signature);
        // spender is signer1 but in signature spender was signer2
        const permit = cutSelector(
            erc20PermitMock.interface.encodeFunctionData('permit', [
                signer1.address,
                signer1.address,
                value,
                defaultDeadline,
                v,
                r,
                s,
            ]),
        );
        await expect(permitableMock.mockPermit(erc20PermitMock, permit)).to.be.revertedWithCustomError(erc20PermitMock, 'ERC2612InvalidSigner');
    });

    it('should be permitted for IDaiLikePermit', async function () {
        const { permitableMock, daiLikePermitMock, chainId } = await loadFixture(deployTokens);

        const permit = await getPermitLikeDai(signer1, daiLikePermitMock, '1', chainId, await permitableMock.getAddress(), true);
        await permitableMock.mockPermit(daiLikePermitMock, permit);

        expect(await daiLikePermitMock.nonces(signer1)).to.be.equal('1');
        expect(await daiLikePermitMock.allowance(signer1, permitableMock)).to.be.equal(constants.MAX_UINT128);
    });

    it('should be permitted for IPermit2', async function () {
        const { permitableMock, daiLikePermitMock, chainId } = await loadFixture(deployTokens);
        const permitContract = await permit2Contract();
        const permit = await getPermit2(signer1, await daiLikePermitMock.getAddress(), chainId, signer2.address, constants.MAX_UINT128);
        await permitableMock.mockPermit(daiLikePermitMock, permit);

        const allowance = await permitContract.allowance(signer1, daiLikePermitMock, signer2);
        expect(allowance.amount).to.equal(constants.MAX_UINT128);
        expect(allowance.nonce).to.equal(1);
    });

    it('should be permitted for IPermit2, compact', async function () {
        const { permitableMock, daiLikePermitMock, chainId } = await loadFixture(deployTokens);
        const permitContract = await permit2Contract();
        const permit = await getPermit2(signer1, await daiLikePermitMock.getAddress(), chainId, await permitableMock.getAddress(), constants.MAX_UINT128, true);
        await permitableMock.mockPermitCompact(daiLikePermitMock, permit);

        const allowance = await permitContract.allowance(signer1, daiLikePermitMock, permitableMock);
        expect(allowance.amount).to.equal(constants.MAX_UINT128);
        expect(allowance.nonce).to.equal(1);
    });

    it('should be permitted for IDaiLikePermit (compact)', async function () {
        const { permitableMock, daiLikePermitMock, chainId } = await loadFixture(deployTokens);

        const permit = await getPermitLikeDai(signer1, daiLikePermitMock, '1', chainId, await permitableMock.getAddress(), true, constants.MAX_UINT256.toString(), true);
        await permitableMock.mockPermitCompact(daiLikePermitMock, permit);

        expect(await daiLikePermitMock.nonces(signer1)).to.be.equal('1');
        expect(await daiLikePermitMock.allowance(signer1, permitableMock)).to.be.equal(constants.MAX_UINT128);
    });

    it('should not be permitted for IDaiLikePermit', async function () {
        const { permitableMock, daiLikePermitMock, chainId } = await loadFixture(deployTokens);

        const name = await daiLikePermitMock.name();
        const nonce = await daiLikePermitMock.nonces(signer1);
        const data = buildDataLikeDai(
            name,
            '1',
            chainId,
            await daiLikePermitMock.getAddress(),
            signer1.address,
            signer2.address,
            nonce.toString(),
            true,
        );
        const signature = await signer1.signTypedData(data.domain, data.types, data.message);
        const { v, r, s } = ethers.Signature.from(signature);

        // spender is signer1 but in signature spender was signer2
        const permit = cutSelector(
            daiLikePermitMock.interface.encodeFunctionData(
                'permit(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)',
                [signer1.address, signer1.address, nonce, defaultDeadline.toString(), true, v, r, s],
            ),
        );

        await expect(permitableMock.mockPermit(daiLikePermitMock, permit)).to.be.revertedWith(
            'Dai/invalid-permit',
        );
    });

    it('should be permitted for IERC7597Permit', async function () {
        const { permitableMock, usdcLikePermitMock, isValidSignatureMock, chainId } = await loadFixture(deployTokens);

        const owner = await isValidSignatureMock.getAddress();

        const permit = await getPermitLikeUSDC(
            owner, signer1, usdcLikePermitMock, '1', chainId, await permitableMock.getAddress(), value.toString(),
        );

        await permitableMock.mockPermit(usdcLikePermitMock, permit);

        expect(await usdcLikePermitMock.nonces(owner)).to.be.equal(1);
        expect(await usdcLikePermitMock.allowance(owner, permitableMock)).to.be.equal(value);
    });

    describe('tryPermit branches', function () {
        // Canonical ERC-7597 argument length: 192 + padded signature.
        const erc7597SignatureLengths = [0, 1, 32, 33, 64, 65, 128, 129, 142, 160, 161];

        function erc7597PermitLength(signatureLength: number): number {
            const padded = signatureLength === 0 ? 0 : Math.ceil(signatureLength / 32) * 32;
            return 192 + padded;
        }

        async function deployErc7597() {
            const base = await deployTokens();
            const wallet = await (await ethers.getContractFactory('ERC1271AcceptAnyMock')).deploy();
            return { ...base, wallet };
        }

        async function expectGas(tx: Promise<{ wait: () => Promise<{ gasUsed: bigint } | null> }>) {
            const receipt = await (await tx).wait();
            if (!hre.globalOptions.coverage) {
                expect(receipt!.gasUsed).toMatchSnapshot();
            }
        }

        for (const signatureLength of erc7597SignatureLengths) {
            it(`permits IERC7597Permit with a ${signatureLength}-byte signature`, async function () {
                const { permitableMock, usdcLikePermitMock, wallet } = await loadFixture(deployErc7597);
                const owner = await wallet.getAddress();
                const spender = await permitableMock.getAddress();
                const signature = '0x' + '11'.repeat(signatureLength);
                const permit = cutSelector(usdcLikePermitMock.interface.encodeFunctionData(
                    'permit(address,address,uint256,uint256,bytes)',
                    [owner, spender, value, constants.MAX_UINT256, signature],
                ));
                expect(ethers.getBytes(permit).length).to.equal(erc7597PermitLength(signatureLength));

                await expectGas(permitableMock.mockPermit(usdcLikePermitMock, permit));

                expect(await usdcLikePermitMock.nonces(owner)).to.equal(1);
                expect(await usdcLikePermitMock.allowance(owner, spender)).to.equal(value);
            });
        }

        it('permits IERC20Permit', async function () {
            const { permitableMock, erc20PermitMock, chainId } = await loadFixture(deployTokens);
            const permit = await getPermit(signer1, erc20PermitMock, '1', chainId, await permitableMock.getAddress(), value.toString());
            expect(ethers.getBytes(permit).length).to.equal(224);

            await expectGas(permitableMock.mockPermit(erc20PermitMock, permit));

            expect(await erc20PermitMock.nonces(signer1)).to.equal(1);
            expect(await erc20PermitMock.allowance(signer1, permitableMock)).to.equal(value);
        });

        it('permits IERC20Permit compact', async function () {
            const { permitableMock, erc20PermitMock, chainId } = await loadFixture(deployTokens);
            const permit = await getPermit(signer1, erc20PermitMock, '1', chainId, await permitableMock.getAddress(), value.toString(), constants.MAX_UINT256.toString(), true);
            expect(ethers.getBytes(permit).length).to.equal(100);

            await expectGas(permitableMock.mockPermitCompact(erc20PermitMock, permit));

            expect(await erc20PermitMock.nonces(signer1)).to.equal(1);
            expect(await erc20PermitMock.allowance(signer1, permitableMock)).to.equal(value);
        });

        it('permits IDaiLikePermit', async function () {
            const { permitableMock, daiLikePermitMock, chainId } = await loadFixture(deployTokens);
            const permit = await getPermitLikeDai(signer1, daiLikePermitMock, '1', chainId, await permitableMock.getAddress(), true);
            expect(ethers.getBytes(permit).length).to.equal(256);

            await expectGas(permitableMock.mockPermit(daiLikePermitMock, permit));

            expect(await daiLikePermitMock.nonces(signer1)).to.equal(1);
            expect(await daiLikePermitMock.allowance(signer1, permitableMock)).to.equal(constants.MAX_UINT128);
        });

        it('permits IDaiLikePermit compact', async function () {
            const { permitableMock, daiLikePermitMock, chainId } = await loadFixture(deployTokens);
            const permit = await getPermitLikeDai(signer1, daiLikePermitMock, '1', chainId, await permitableMock.getAddress(), true, constants.MAX_UINT256.toString(), true);
            expect(ethers.getBytes(permit).length).to.equal(72);

            await expectGas(permitableMock.mockPermitCompact(daiLikePermitMock, permit));

            expect(await daiLikePermitMock.nonces(signer1)).to.equal(1);
            expect(await daiLikePermitMock.allowance(signer1, permitableMock)).to.equal(constants.MAX_UINT128);
        });

        it('permits IPermit2', async function () {
            const { permitableMock, daiLikePermitMock, chainId } = await loadFixture(deployTokens);
            const permitContract = await permit2Contract();
            const permit = await getPermit2(signer1, await daiLikePermitMock.getAddress(), chainId, signer2.address, constants.MAX_UINT128);
            expect(ethers.getBytes(permit).length).to.equal(352);

            await expectGas(permitableMock.mockPermit(daiLikePermitMock, permit));

            const allowance = await permitContract.allowance(signer1, daiLikePermitMock, signer2);
            expect(allowance.amount).to.equal(constants.MAX_UINT128);
            expect(allowance.nonce).to.equal(1);
        });

        it('permits IPermit2 compact', async function () {
            const { permitableMock, daiLikePermitMock, chainId } = await loadFixture(deployTokens);
            const permitContract = await permit2Contract();
            const permit = await getPermit2(signer1, await daiLikePermitMock.getAddress(), chainId, await permitableMock.getAddress(), constants.MAX_UINT128, true);
            expect(ethers.getBytes(permit).length).to.equal(96);

            await expectGas(permitableMock.mockPermitCompact(daiLikePermitMock, permit));

            const allowance = await permitContract.allowance(signer1, daiLikePermitMock, permitableMock);
            expect(allowance.amount).to.equal(constants.MAX_UINT128);
            expect(allowance.nonce).to.equal(1);
        });

        it('returns false for a permit length that matches no standard', async function () {
            const { permitableMock, erc20PermitMock } = await loadFixture(deployTokens);

            expect(await permitableMock.mockTryPermit.staticCall(erc20PermitMock, '0xabcd')).to.equal(false);
        });
    });
});
