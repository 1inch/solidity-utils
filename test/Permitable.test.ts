import { expect } from 'chai';
const { expectRevert } = require('@openzeppelin/test-helpers');
import { fromRpcSig } from 'ethereumjs-util';
import { defaultDeadline, trim0x, buildData, buildDataLikeDai, getPermit, getPermitLikeDai } from '../testHelpers/permit.js';
import { web3 } from 'hardhat';
import types from "../typechain-types";
import ethSigUtil from 'eth-sig-util';
import { toBN } from 'web3-utils';

const ERC20PermitMock = artifacts.require('ERC20PermitMock');
const DaiLikePermitMock = artifacts.require('DaiLikePermitMock');
const PermitableMock = artifacts.require('PermitableMock');

contract('Permitable', function ([wallet1, wallet2]) {
    const initContext = async () => {
        const permittableMock = await PermitableMock.new();
        const chainId = await web3.eth.getChainId();
        const erc20PermitMock: types.ERC20PermitMockInstance = undefined!;
        const daiLikePermitMock: types.DaiLikePermitMockInstance = undefined!;
        return { permittableMock, chainId, erc20PermitMock, daiLikePermitMock };
    }

    let context: Awaited<ReturnType<typeof initContext>> = undefined!;

    before(async () => {
        context = await initContext();
    });

    before(async function () {

    });

    beforeEach(async function () {
        context.erc20PermitMock = await ERC20PermitMock.new('USDC', 'USDC', wallet1, toBN(100));
        context.daiLikePermitMock = await DaiLikePermitMock.new('DAI', 'DAI', wallet1, toBN(100));
    });

    describe('_permit', async function () {
        before(async function () {
            const account = await web3.eth.accounts.create();
            this.wallet = {
                address: account.address,
                privateKey: account.privateKey,
            };

            this.owner = this.wallet.address;
            this.holder = this.owner;
        });

        const value = toBN(42);
        const nonce = '0';
        
        it('should be permitted for IERC20Permit', async function () {
            const permit = await getPermit(this.owner, this.wallet.privateKey, this.ERC20PermitMock, '1', this.chainId, wallet2, value.toString());
            await this.PermitableMock.__permit(this.ERC20PermitMock.address, permit);
            expect(await this.ERC20PermitMock.nonces(this.owner)).to.be.bignumber.equal('1');
            expect(await this.ERC20PermitMock.allowance(this.owner, wallet2)).to.be.bignumber.equal(value);
        });

        it('should not be permitted for IERC20Permit', async function () {
            const data = buildData(await this.ERC20PermitMock.name(), '1', this.chainId, this.ERC20PermitMock.address, this.owner, wallet2, value.toString(), nonce);
            const signature = (ethSigUtil as any).signTypedMessage(Buffer.from(trim0x(this.wallet.privateKey), 'hex'), { data });
            const { v, r, s } = fromRpcSig(signature);

            const permit = web3.eth.abi.encodeParameter(
                'tuple(address,address,uint256,uint256,uint8,bytes32,bytes32)',
                [this.owner, wallet1, value, defaultDeadline, v, r, s],
            );
            
            await expectRevert(
                this.PermitableMock.__permit(this.ERC20PermitMock.address, permit),
                'Permit failed: Error(ERC20Permit: invalid signature)',
            );
        });

        it('should be permitted for IDaiLikePermit', async function () {
            const permit = await getPermitLikeDai(this.holder, this.wallet.privateKey, this.DaiLikePermitMock, '1', this.chainId, wallet2, true);
            await this.PermitableMock.__permit(this.DaiLikePermitMock.address, permit);

            const MAX_UINT128 = toBN('2').pow(toBN('128')).sub(toBN('1'));
            expect(await this.DaiLikePermitMock.nonces(this.owner)).to.be.bignumber.equal('1');
            expect(await this.DaiLikePermitMock.allowance(this.owner, wallet2)).to.be.bignumber.equal(MAX_UINT128);
        });

        it('should not be permitted for IDaiLikePermit', async function () {
            const data = buildDataLikeDai(await this.DaiLikePermitMock.name(), '1', this.chainId, this.DaiLikePermitMock.address, this.holder, wallet2, nonce, true);
            const signature = (ethSigUtil as any).signTypedMessage(Buffer.from(trim0x(this.wallet.privateKey), 'hex'), { data });
            const { v, r, s } = fromRpcSig(signature);

            const payload = web3.eth.abi.encodeParameter(
                'tuple(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)',
                [this.holder, wallet1, nonce, defaultDeadline, true, v, r, s],
            );
              
            await expectRevert(
                this.PermitableMock.__permit(this.DaiLikePermitMock.address, payload),
                'Permit failed: Error(Dai/invalid-permit)',
            );
        });

        it('should be wrong permit length', async function () {
            const data = buildData(await this.ERC20PermitMock.name(), '1', this.chainId, this.ERC20PermitMock.address, this.owner, wallet2, value.toString(), nonce);
            const signature = (ethSigUtil as any).signTypedMessage(Buffer.from(trim0x(this.wallet.privateKey), 'hex'), { data });
            const { v, r, s } = fromRpcSig(signature);

            const permit = web3.eth.abi.encodeParameter(
                'tuple(address,uint256,uint256,uint8,bytes32,bytes32)',
                [wallet2, value, defaultDeadline, v, r, s],
            );
            await expectRevert(
                this.PermitableMock.__permit(this.ERC20PermitMock.address, permit),
                'Wrong permit length',
            );
        });
    });
});
