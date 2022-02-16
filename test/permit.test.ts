import { expect } from '../src/prelude';
import { web3 } from 'hardhat';
import { defaultDeadline, EIP712Domain, Permit, DaiLikePermit } from '../src/permit';
import { trim0x, buildData, buildDataLikeDai, withTarget } from '../src/permit';

const ERC20PermitMock = artifacts.require('ERC20PermitMock');
const DaiLikePermitMock = artifacts.require('DaiLikePermitMock');

describe('Methods', async () => {
    const initContext = async () => {
        const account = web3.eth.accounts.create();
        const wallet = {
            address: account.address,
            privateKey: account.privateKey,
        };

        const token = await ERC20PermitMock.new('Token', 'TKN', wallet.address, '1');
        const daiLikeToken = await DaiLikePermitMock.new('DaiLikeToken', 'DLT', wallet.address, '1');
        const chainId = await web3.eth.getChainId();
        return { account, wallet, token, daiLikeToken, chainId };
    };

    let context: Awaited<ReturnType<typeof initContext>> = undefined!;

    before(async () => {
        context = await initContext();
    });

    it('should be trimmed', async () => {
        expect(trim0x('0x123456')).to.be.equal('123456');
    });

    it('should not be changed', async () => {
        expect(trim0x('123456')).to.be.equal('123456');
    });

    it('should correctly build data for permit', async () => {
        const data = buildData(await context.token.name(), '1', context.chainId, context.token.address, context.wallet.address, context.wallet.address, '1', '1');
        expect(data).to.be.deep.equal({
            primaryType: 'Permit',
            types: {
                EIP712Domain: EIP712Domain,
                Permit: Permit,
            },
            domain: {
                name: await context.token.name(),
                version: '1',
                chainId: 31337,
                verifyingContract: context.token.address,
            },
            message: {
                owner: context.wallet.address,
                spender: context.wallet.address,
                value: '1',
                nonce: '1',
                deadline: defaultDeadline,
            },
        });
    });

    it('should correctly build data for dai-like permit', async () => {
        const data = buildDataLikeDai(await context.daiLikeToken.name(), '1', context.chainId, context.daiLikeToken.address, context.wallet.address, context.wallet.address, '1', true);
        expect(data).to.be.deep.equal({
            primaryType: 'Permit',
            types: {
                EIP712Domain: EIP712Domain,
                Permit: DaiLikePermit,
            },
            domain: {
                name: await context.daiLikeToken.name(),
                version: '1',
                chainId: 31337,
                verifyingContract: context.daiLikeToken.address,
            },
            message: {
                holder: context.wallet.address,
                spender: context.wallet.address,
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
