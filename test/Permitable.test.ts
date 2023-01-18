import { expect } from '../src/prelude';
import { defaultDeadline, buildData, buildDataLikeDai, getPermit, getPermit2, getPermitLikeDai } from '../src/permit';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { cutSelector } from '../src/permit';
import { constants } from '../src/prelude';
import { splitSignature } from 'ethers/lib/utils';
import { bytecode } from './permit2Data/permit2.json';

const value = 42n;
const PERMIT2 = '0x000000000022D473030F116dDEE9F6B43aC78BA3';

describe('Permitable', function () {
    let signer1: SignerWithAddress;
    let signer2: SignerWithAddress;

    before(async function () {
        [signer1, signer2] = await ethers.getSigners();
    });

    async function deployTokens() {
        const PermitableMock = await ethers.getContractFactory('PermitableMock');
        const ERC20PermitMock = await ethers.getContractFactory('ERC20PermitMock');
        const DaiLikePermitMock = await ethers.getContractFactory('DaiLikePermitMock');
        const SafeERC20 = await ethers.getContractFactory('SafeERC20');

        const chainId = (await ethers.provider.getNetwork()).chainId;
        const permitableMock = await PermitableMock.deploy();
        const erc20PermitMock = await ERC20PermitMock.deploy('USDC', 'USDC', signer1.address, 100n);
        const daiLikePermitMock = await DaiLikePermitMock.deploy('DAI', 'DAI', signer1.address, 100n);
        const safeERC20 = await SafeERC20.attach(permitableMock.address);
        return { permitableMock, erc20PermitMock, daiLikePermitMock, safeERC20, chainId };
    }

    it('should be permitted for IERC20Permit', async function () {
        const { permitableMock, erc20PermitMock, chainId } = await loadFixture(deployTokens);

        const permit = await getPermit(signer1, erc20PermitMock, '1', chainId, permitableMock.address, value.toString());
        await permitableMock.mockPermit(erc20PermitMock.address, permit);
        expect(await erc20PermitMock.nonces(signer1.address)).to.be.equal('1');
        expect(await erc20PermitMock.allowance(signer1.address, permitableMock.address)).to.be.equal(value);
    });

    it('should be permitted for IERC20Permit (compact)', async function () {
        const { permitableMock, erc20PermitMock, chainId } = await loadFixture(deployTokens);

        const permit = await getPermit(signer1, erc20PermitMock, '1', chainId, permitableMock.address, value.toString(), constants.MAX_UINT256.toString(), true);
        await permitableMock.mockPermitCompact(erc20PermitMock.address, permit);
        expect(await erc20PermitMock.nonces(signer1.address)).to.be.equal('1');
        expect(await erc20PermitMock.allowance(signer1.address, permitableMock.address)).to.be.equal(value);
    });

    it('should not be permitted for IERC20Permit', async function () {
        const { permitableMock, erc20PermitMock, chainId } = await loadFixture(deployTokens);

        const name = await erc20PermitMock.name();
        const nonce = await erc20PermitMock.nonces(signer1.address);
        const data = buildData(
            name,
            '1',
            chainId,
            erc20PermitMock.address,
            signer1.address,
            signer2.address,
            value.toString(),
            nonce.toString(),
        );
        const signature = await signer1._signTypedData(data.domain, data.types, data.message);
        const { v, r, s } = splitSignature(signature);
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
        await expect(permitableMock.mockPermit(erc20PermitMock.address, permit)).to.be.revertedWith(
            'ERC20Permit: invalid signature',
        );
    });

    it('should be permitted for IDaiLikePermit', async function () {
        const { permitableMock, daiLikePermitMock, chainId } = await loadFixture(deployTokens);

        const permit = await getPermitLikeDai(signer1, daiLikePermitMock, '1', chainId, permitableMock.address, true);
        await permitableMock.mockPermit(daiLikePermitMock.address, permit);

        expect(await daiLikePermitMock.nonces(signer1.address)).to.be.equal('1');
        expect(await daiLikePermitMock.allowance(signer1.address, permitableMock.address)).to.be.equal(constants.MAX_UINT128);
    });

    it('should be permitted for IPermit2', async function () {
        const { permitableMock, daiLikePermitMock, chainId } = await loadFixture(deployTokens);
        await ethers.provider.send('hardhat_setCode', [PERMIT2, bytecode]);
        const permit2Contract = await ethers.getContractAt('IPermit2', PERMIT2);
        const permit = await getPermit2(signer1, permit2Contract, daiLikePermitMock.address, chainId, signer2.address, constants.MAX_UINT128);
        await permitableMock.mockPermit(daiLikePermitMock.address, permit);

        const allowance = await permit2Contract.allowance(signer1.address, daiLikePermitMock.address, signer2.address);
        expect(allowance.amount).to.equal(constants.MAX_UINT128);
        expect(allowance.nonce).to.equal(1);
    });

    it('should be permitted for IDaiLikePermit (compact)', async function () {
        const { permitableMock, daiLikePermitMock, chainId } = await loadFixture(deployTokens);

        const permit = await getPermitLikeDai(signer1, daiLikePermitMock, '1', chainId, permitableMock.address, true, constants.MAX_UINT256.toString(), true);
        await permitableMock.mockPermitCompact(daiLikePermitMock.address, permit);

        expect(await daiLikePermitMock.nonces(signer1.address)).to.be.equal('1');
        expect(await daiLikePermitMock.allowance(signer1.address, permitableMock.address)).to.be.equal(constants.MAX_UINT128);
    });

    it('should not be permitted for IDaiLikePermit', async function () {
        const { permitableMock, daiLikePermitMock, chainId } = await loadFixture(deployTokens);

        const name = await daiLikePermitMock.name();
        const nonce = await daiLikePermitMock.nonces(signer1.address);
        const data = buildDataLikeDai(
            name,
            '1',
            chainId,
            daiLikePermitMock.address,
            signer1.address,
            signer2.address,
            nonce.toString(),
            true,
        );
        const signature = await signer1._signTypedData(data.domain, data.types, data.message);
        const { v, r, s } = splitSignature(signature);

        // spender is signer1 but in signature spender was signer2
        const permit = cutSelector(
            daiLikePermitMock.interface.encodeFunctionData(
                'permit(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)',
                [signer1.address, signer1.address, nonce, defaultDeadline.toString(), true, v, r, s],
            ),
        );

        await expect(permitableMock.mockPermit(daiLikePermitMock.address, permit)).to.be.revertedWith(
            'Dai/invalid-permit',
        );
    });

    it('should be wrong permit length', async function () {
        const { permitableMock, erc20PermitMock, safeERC20, chainId } = await loadFixture(deployTokens);

        const name = await erc20PermitMock.name();
        const nonce = await erc20PermitMock.nonces(signer1.address);
        const data = buildData(
            name,
            '1',
            chainId,
            erc20PermitMock.address,
            signer1.address,
            signer2.address,
            value.toString(),
            nonce.toString(),
        );
        const signature = await signer1._signTypedData(data.domain, data.types, data.message);
        const { v, r, s } = splitSignature(signature);

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

        await expect(permitableMock.mockPermit(erc20PermitMock.address, permit)).to.be.revertedWithCustomError(
            safeERC20,
            'SafePermitBadLength',
        );
    });
});
