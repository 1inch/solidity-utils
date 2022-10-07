import { expect } from '../src/prelude';
import { defaultDeadline, buildData, buildDataLikeDai, getPermit, getPermitLikeDai } from '../src/permit';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { cutSelector } from '../src/permit';
import { constants } from '../src/prelude';
import { splitSignature } from 'ethers/lib/utils';

const value = 42n;

describe('Permitable', async function () {
    let signer1: SignerWithAddress;
    let signer2: SignerWithAddress;

    before(async function () {
        [signer1, signer2] = await ethers.getSigners();
    });

    async function deployTokens() {
        const PermitableMock = await ethers.getContractFactory('PermitableMock');
        const ERC20PermitMock = await ethers.getContractFactory('ERC20PermitMock');
        const DaiLikePermitMock = await ethers.getContractFactory('DaiLikePermitMock');

        const chainId = (await ethers.provider.getNetwork()).chainId;
        const permitableMock = await PermitableMock.deploy();
        const erc20PermitMock = await ERC20PermitMock.deploy('USDC', 'USDC', signer1.address, 100n);
        const daiLikePermitMock = await DaiLikePermitMock.deploy('DAI', 'DAI', signer1.address, 100n);
        return { permitableMock, erc20PermitMock, daiLikePermitMock, chainId };
    }

    it('should be permitted for IERC20Permit', async function () {
        const { permitableMock, erc20PermitMock, chainId } = await loadFixture(deployTokens);

        const permit = await getPermit(signer1, erc20PermitMock, '1', chainId, signer2.address, value.toString());
        await permitableMock.mockPermit(erc20PermitMock.address, permit);
        expect(await erc20PermitMock.nonces(signer1.address)).to.be.equal('1');
        expect(await erc20PermitMock.allowance(signer1.address, signer2.address)).to.be.equal(value);
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

        const permit = await getPermitLikeDai(signer1, daiLikePermitMock, '1', chainId, signer2.address, true);
        await permitableMock.mockPermit(daiLikePermitMock.address, permit);

        expect(await daiLikePermitMock.nonces(signer1.address)).to.be.equal('1');
        expect(await daiLikePermitMock.allowance(signer1.address, signer2.address)).to.be.equal(constants.MAX_UINT128);
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
            permitableMock,
            'SafePermitBadLength',
        );
    });
});
