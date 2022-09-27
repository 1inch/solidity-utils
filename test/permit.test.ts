import { expect } from '../src/prelude';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { defaultDeadline, Permit, DaiLikePermit } from '../src/permit';
import { trim0x, buildData, buildDataLikeDai, withTarget } from '../src/permit';

describe('Permit library', async function () {
    let signer1: SignerWithAddress;

    before(async function () {
        [signer1] = await ethers.getSigners();
    });

    async function deployTokens () {
        const ERC20PermitMock = await ethers.getContractFactory('ERC20PermitMock');
        const DaiLikePermitMock = await ethers.getContractFactory('DaiLikePermitMock');

        const chainId = (await ethers.provider.getNetwork()).chainId;
        const erc20PermitMock = await ERC20PermitMock.deploy('USDC', 'USDC', signer1.address, 100n);
        const daiLikePermitMock = await DaiLikePermitMock.deploy('DAI', 'DAI', signer1.address, 100n);
        return { erc20PermitMock, daiLikePermitMock, chainId };
    }

    it('should be trimmed', async () => {
        expect(trim0x('0x123456')).to.be.equal('123456');
    });

    it('should not be changed', async () => {
        expect(trim0x('123456')).to.be.equal('123456');
    });

    it('should correctly build data for permit', async () => {
        const { erc20PermitMock, chainId } = await loadFixture(deployTokens);

        const name = await erc20PermitMock.name();
        const data = buildData(name, '1', chainId, erc20PermitMock.address, signer1.address, signer1.address, '1', '1');
        expect(data).to.be.deep.equal({
            types: {
                Permit: Permit,
            },
            domain: {
                name,
                version: '1',
                chainId: 31337,
                verifyingContract: erc20PermitMock.address,
            },
            message: {
                owner: signer1.address,
                spender: signer1.address,
                value: '1',
                nonce: '1',
                deadline: defaultDeadline,
            },
        });
    });

    it('should correctly build data for dai-like permit', async () => {
        const { daiLikePermitMock, chainId } = await loadFixture(deployTokens);

        const name = await daiLikePermitMock.name();
        const data = buildDataLikeDai(name, '1', chainId, daiLikePermitMock.address, signer1.address, signer1.address, '1', true);
        expect(data).to.be.deep.equal({
            types: {
                Permit: DaiLikePermit,
            },
            domain: {
                name,
                version: '1',
                chainId: 31337,
                verifyingContract: daiLikePermitMock.address,
            },
            message: {
                holder: signer1.address,
                spender: signer1.address,
                nonce: '1',
                allowed: true,
                expiry: defaultDeadline,
            },
        });
    });

    it('should concat target with prefixed data', async () => {
        expect(withTarget('0x123456', '0x123456')).to.be.equal('0x123456123456');
    });

    it('should concat target with raw data', async () => {
        expect(withTarget('0x123456', '123456')).to.be.equal('0x123456123456');
    });
});
