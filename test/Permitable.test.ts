import { expect, toBN } from '../src/prelude';
import { fromRpcSig } from 'ethereumjs-util';
import { defaultDeadline, buildData, buildDataLikeDai, getPermit, getPermitLikeDai, signWithPk } from '../src/permit';
import { web3 } from 'hardhat';
import types from '../typechain-types';

const ERC20PermitMock = artifacts.require('ERC20PermitMock');
const DaiLikePermitMock = artifacts.require('DaiLikePermitMock');
const PermitableMock = artifacts.require('PermitableMock');

const value = toBN(42);
const nonce = '0';

contract('Permitable', function ([wallet1, wallet2]) {
    const initContext = async () => {
        const permittableMock = await PermitableMock.new();
        const chainId = await web3.eth.getChainId();
        const account = await web3.eth.accounts.create();
        const wallet = {
            address: account.address,
            privateKey: account.privateKey,
        };
        const owner = wallet.address;
        const holder = owner;
        const erc20PermitMock: types.ERC20PermitMockInstance = undefined!;
        const daiLikePermitMock: types.DaiLikePermitMockInstance = undefined!;
        return { permittableMock, chainId, wallet, owner, holder, erc20PermitMock, daiLikePermitMock };
    };

    let context: Awaited<ReturnType<typeof initContext>> = undefined!;

    before(async () => {
        context = await initContext();
    });

    beforeEach(async function () {
        context.erc20PermitMock = await ERC20PermitMock.new('USDC', 'USDC', wallet1, toBN(100));
        context.daiLikePermitMock = await DaiLikePermitMock.new('DAI', 'DAI', wallet1, toBN(100));
    });

    it('should be permitted for IERC20Permit', async function () {
        const permit = await getPermit(context.owner, context.wallet.privateKey, context.erc20PermitMock, '1', context.chainId, wallet2, value.toString());
        await context.permittableMock.__permit(context.erc20PermitMock.address, permit);
        expect(await context.erc20PermitMock.nonces(context.owner)).to.be.bignumber.equal('1');
        expect(await context.erc20PermitMock.allowance(context.owner, wallet2)).to.be.bignumber.equal(value);
    });

    it('should not be permitted for IERC20Permit', async function () {
        const data = buildData(await context.erc20PermitMock.name(), '1', context.chainId, context.erc20PermitMock.address, context.owner, wallet2, value.toString(), nonce);
        const signature = signWithPk(context.wallet.privateKey, data);
        const { v, r, s } = fromRpcSig(signature);

        const permit = web3.eth.abi.encodeParameter(
            'tuple(address,address,uint256,uint256,uint8,bytes32,bytes32)',
            [context.owner, wallet1, value, defaultDeadline, v, r, s],
        );
        expect(context.permittableMock.__permit(context.erc20PermitMock.address, permit))
            .to.eventually.be.rejectedWith('Permit failed: Error(ERC20Permit: invalid signature)');
    });

    it('should be permitted for IDaiLikePermit', async function () {
        const permit = await getPermitLikeDai(context.holder, context.wallet.privateKey, context.daiLikePermitMock, '1', context.chainId, wallet2, true);
        await context.permittableMock.__permit(context.daiLikePermitMock.address, permit);

        const MAX_UINT128 = toBN('2').pow(toBN('128')).sub(toBN('1'));
        expect(await context.daiLikePermitMock.nonces(context.owner)).to.be.bignumber.equal('1');
        expect(await context.daiLikePermitMock.allowance(context.owner, wallet2)).to.be.bignumber.equal(MAX_UINT128);
    });

    it('should not be permitted for IDaiLikePermit', async function () {
        const data = buildDataLikeDai(await context.daiLikePermitMock.name(), '1', context.chainId, context.daiLikePermitMock.address, context.holder, wallet2, nonce, true);
        const signature = signWithPk(context.wallet.privateKey, data);
        const { v, r, s } = fromRpcSig(signature);

        const payload = web3.eth.abi.encodeParameter(
            'tuple(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)',
            [context.holder, wallet1, nonce, defaultDeadline, true, v, r, s],
        );

        expect(context.permittableMock.__permit(context.daiLikePermitMock.address, payload))
            .to.eventually.be.rejectedWith('Permit failed: Error(Dai/invalid-permit)');
    });

    it('should be wrong permit length', async function () {
        const data = buildData(await context.erc20PermitMock.name(), '1', context.chainId, context.erc20PermitMock.address, context.owner, wallet2, value.toString(), nonce);
        const signature = signWithPk(context.wallet.privateKey, data);
        const { v, r, s } = fromRpcSig(signature);

        const permit = web3.eth.abi.encodeParameter(
            'tuple(address,uint256,uint256,uint8,bytes32,bytes32)',
            [wallet2, value, defaultDeadline, v, r, s],
        );

        expect(context.permittableMock.__permit(context.erc20PermitMock.address, permit))
            .to.eventually.be.rejectedWith( 'Wrong permit length');
    });
});
