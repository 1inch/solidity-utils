import { expect } from '../src/expect';
import { defaultDeadline, Permit, DaiLikePermit, trim0x, buildData, buildDataLikeDai, withTarget } from '../src/permit';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Permit library', function () {
    let signer1: SignerWithAddress;

    before(async function () {
        [signer1] = await ethers.getSigners();
    });

    async function deployTokens() {
        const ERC20PermitMock = await ethers.getContractFactory('ERC20PermitMock');
        const DaiLikePermitMock = await ethers.getContractFactory('DaiLikePermitMock');

        const chainId = Number((await ethers.provider.getNetwork()).chainId);
        const erc20PermitMock = await ERC20PermitMock.deploy('USDC', 'USDC', signer1, 100n);
        const daiLikePermitMock = await DaiLikePermitMock.deploy('DAI', 'DAI', signer1, 100n);
        return { erc20PermitMock, daiLikePermitMock, chainId };
    }

    it('should be trimmed', async function () {
        expect(trim0x('0x123456')).to.be.equal('123456');
    });

    it('should not be changed', async function () {
        expect(trim0x('123456')).to.be.equal('123456');
    });

    it('should correctly build data for permit', async function () {
        const { erc20PermitMock, chainId } = await loadFixture(deployTokens);

        const name = await erc20PermitMock.name();
        const data = buildData(name, '1', chainId, await erc20PermitMock.getAddress(), signer1.address, signer1.address, '1', '1');
        expect(data).to.be.deep.equal({
            types: {
                Permit: Permit,
            },
            domain: {
                name,
                version: '1',
                chainId: 31337,
                verifyingContract: await erc20PermitMock.getAddress(),
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

    it('should correctly build data for dai-like permit', async function () {
        const { daiLikePermitMock, chainId } = await loadFixture(deployTokens);

        const name = await daiLikePermitMock.name();
        const data = buildDataLikeDai(
            name,
            '1',
            chainId,
            await daiLikePermitMock.getAddress(),
            signer1.address,
            signer1.address,
            '1',
            true,
        );
        expect(data).to.be.deep.equal({
            types: {
                Permit: DaiLikePermit,
            },
            domain: {
                name,
                version: '1',
                chainId: 31337,
                verifyingContract: await daiLikePermitMock.getAddress(),
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

    it('should concat target with prefixed data', async function () {
        expect(withTarget('0x123456', '0x123456')).to.be.equal('0x123456123456');
    });

    it('should concat target with raw data', async function () {
        expect(withTarget('0x123456', '123456')).to.be.equal('0x123456123456');
    });
});
