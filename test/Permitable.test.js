const { expect } = require('chai');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { fromRpcSig } = require('ethereumjs-util');
const { defaultDeadline, trim0x, buildData, buildDataLikeDai, getPermit, getPermitLikeDai } = require('../testHelpers/permit.js');
const { web3 } = require('hardhat');

const ethSigUtil = require('eth-sig-util');

const ERC20PermitMock = artifacts.require('ERC20PermitMock');
const DaiLikePermitMock = artifacts.require('DaiLikePermitMock');
const PermitableMock = artifacts.require('PermitableMock');

contract('Permitable', function ([wallet1, wallet2]) {
    before(async function () {
        this.PermitableMock = await PermitableMock.new();
        this.chainId = await web3.eth.getChainId();
    });

    beforeEach(async function () {
        this.ERC20PermitMock = await ERC20PermitMock.new('USDC', 'USDC', wallet1, new web3.utils.BN(100));
        this.DaiLikePermitMock = await DaiLikePermitMock.new('DAI', 'DAI', wallet1, new web3.utils.BN(100));
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

        const value = new web3.utils.BN(42);
        const nonce = 0;
        
        it('should be permitted for IERC20Permit', async function () {
            const permit = await getPermit(this.owner, this.wallet.privateKey, this.ERC20PermitMock, '1', this.chainId, wallet2, value);
            await this.PermitableMock.__permit(this.ERC20PermitMock.address, permit);
            expect(await this.ERC20PermitMock.nonces(this.owner)).to.be.bignumber.equal('1');
            expect(await this.ERC20PermitMock.allowance(this.owner, wallet2)).to.be.bignumber.equal(value);
        });

        it('should not be permitted for IERC20Permit', async function () {
            const data = buildData(await this.ERC20PermitMock.name(), '1', this.chainId, this.ERC20PermitMock.address, this.owner, wallet2, value, nonce);
            const signature = ethSigUtil.signTypedMessage(Buffer.from(trim0x(this.wallet.privateKey), 'hex'), { data });
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

            const MAX_UINT128 = new web3.utils.BN('2').pow(new web3.utils.BN('128')).sub(new web3.utils.BN('1'));
            expect(await this.DaiLikePermitMock.nonces(this.owner)).to.be.bignumber.equal('1');
            expect(await this.DaiLikePermitMock.allowance(this.owner, wallet2)).to.be.bignumber.equal(MAX_UINT128);
        });

        it('should not be permitted for IDaiLikePermit', async function () {
            const data = buildDataLikeDai(await this.DaiLikePermitMock.name(), '1', this.chainId, this.DaiLikePermitMock.address, this.holder, wallet2, nonce, true);
            const signature = ethSigUtil.signTypedMessage(Buffer.from(trim0x(this.wallet.privateKey), 'hex'), { data });
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
            const data = buildData(await this.ERC20PermitMock.name(), '1', this.chainId, this.ERC20PermitMock.address, this.owner, wallet2, value, nonce);
            const signature = ethSigUtil.signTypedMessage(Buffer.from(trim0x(this.wallet.privateKey), 'hex'), { data });
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
