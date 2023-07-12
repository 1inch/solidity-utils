import { expect } from '../src/prelude';
import { defaultDeadline, buildData, buildDataLikeDai, getPermit, getPermit2, getPermitLikeDai, permit2Contract } from '../src/permit';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { cutSelector } from '../src/permit';
import { constants } from '../src/prelude';
import { Signature } from 'ethers';

const value = 42n;

describe('Permitable', function () {
    let signer1: SignerWithAddress;
    let signer2: SignerWithAddress;

    before(async function () {
        [signer1, signer2] = await ethers.getSigners();
    });

    async function deployTokens() {
        const PermitableMockFactory = await ethers.getContractFactory('PermitableMock');
        const ERC20PermitMockFactory = await ethers.getContractFactory('ERC20PermitMock');
        const DaiLikePermitMockFactory = await ethers.getContractFactory('DaiLikePermitMock');
        const SafeERC20Factory = await ethers.getContractFactory('SafeERC20');

        const chainId = Number((await ethers.provider.getNetwork()).chainId);
        const permitableMock = await PermitableMockFactory.deploy();
        const erc20PermitMock = await ERC20PermitMockFactory.deploy('USDC', 'USDC', signer1, 100n);
        const daiLikePermitMock = await DaiLikePermitMockFactory.deploy('DAI', 'DAI', signer1, 100n);
        const safeERC20 = await SafeERC20Factory.attach(permitableMock);
        return { permitableMock, erc20PermitMock, daiLikePermitMock, safeERC20, chainId };
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
        await expect(permitableMock.mockPermit(erc20PermitMock, permit)).to.be.revertedWith('ERC20Permit: expired deadline');
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
        const { v, r, s } = Signature.from(signature);
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
        await expect(permitableMock.mockPermit(erc20PermitMock, permit)).to.be.revertedWith(
            'ERC20Permit: invalid signature',
        );
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
        const { v, r, s } = Signature.from(signature);

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

    it('should be wrong permit length', async function () {
        const { permitableMock, erc20PermitMock, safeERC20, chainId } = await loadFixture(deployTokens);

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
        const { v, r, s } = Signature.from(signature);

        const permit =
            '0x' +
            cutSelector(
                erc20PermitMock.interface.encodeFunctionData('permit', [
                    signer1.address,
                    signer1.address,
                    value,
                    defaultDeadline,
                    v,
                    r,
                    s,
                ]),
            ).substring(64);

        await expect(permitableMock.mockPermit(erc20PermitMock, permit)).to.be.revertedWithCustomError(
            safeERC20,
            'SafePermitBadLength',
        );
    });
});
