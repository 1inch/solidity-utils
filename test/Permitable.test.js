const { expect } = require('chai');
const { expectRevert, BN, constants } = require('@openzeppelin/test-helpers');
const { fromRpcSig } = require('ethereumjs-util');

const Wallet = require('ethereumjs-wallet').default;
const ethSigUtil = require('eth-sig-util');

const ERC20PermitMock = artifacts.require('ERC20PermitMock');
const DaiLikePermitMock = artifacts.require('DaiLikePermitMock');
const PermitableMock = artifacts.require('PermitableMock');

const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
];

const Permit = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
];

const DaiLikePermit = [
    { name: 'holder', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
    { name: 'allowed', type: 'bool' },
];

contract('Permitable', function ([wallet1, wallet2]) {
    before(async function () {
        this.PermitableMock = await PermitableMock.new();
        this.chainId = await web3.eth.getChainId();
    });

    beforeEach(async function () {
        this.ERC20PermitMock = await ERC20PermitMock.new('USDC', 'USDC', wallet1, new BN(100));
        this.DaiLikePermitMock = await DaiLikePermitMock.new('DAI', 'DAI', wallet1, new BN(100));
    });

    describe('_permit', async function () {
        const wallet = Wallet.generate();

        const owner = wallet.getAddressString();
        const holder = owner;
        const value = new BN(42);
        const nonce = 0;
        const maxDeadline = constants.MAX_UINT256;

        const buildData = (chainId, verifyingContract, name, version, spender, deadline = maxDeadline) => ({
            primaryType: 'Permit',
            types: { EIP712Domain, Permit },
            domain: { name, version, chainId, verifyingContract },
            message: { owner, spender, value, nonce, deadline },
        });

        const buildDataLikeDai = (chainId, verifyingContract, name, version, spender, allowed, expiry = maxDeadline) => ({
            primaryType: 'Permit',
            types: { EIP712Domain, Permit: DaiLikePermit },
            domain: { name, version, chainId, verifyingContract },
            message: { holder, spender, nonce, expiry, allowed },
        });

        it('should be permitted for IERC20Permit', async function () {
            const data = buildData(this.chainId, this.ERC20PermitMock.address, await this.ERC20PermitMock.name(), '1', wallet2);
            const signature = ethSigUtil.signTypedMessage(wallet.getPrivateKey(), { data });
            const { v, r, s } = fromRpcSig(signature);

            const permit = web3.eth.abi.encodeParameter(
                'tuple(address,address,uint256,uint256,uint8,bytes32,bytes32)',
                [owner, wallet2, value, maxDeadline, v, r, s],
            );
            await this.PermitableMock.__permit(this.ERC20PermitMock.address, permit);

            expect(await this.ERC20PermitMock.nonces(owner)).to.be.bignumber.equal('1');
            expect(await this.ERC20PermitMock.allowance(owner, wallet2)).to.be.bignumber.equal(value);
        });

        it('should not be permitted for IERC20Permit', async function () {
            const data = buildData(this.chainId, this.ERC20PermitMock.address, await this.ERC20PermitMock.name(), '1', wallet2);
            const signature = ethSigUtil.signTypedMessage(wallet.getPrivateKey(), { data });
            const { v, r, s } = fromRpcSig(signature);

            const permit = web3.eth.abi.encodeParameter(
                'tuple(address,address,uint256,uint256,uint8,bytes32,bytes32)',
                [owner, wallet1, value, maxDeadline, v, r, s],
            );
            
            await expectRevert(
                this.PermitableMock.__permit(this.ERC20PermitMock.address, permit),
                'Permit failed: Error(ERC20Permit: invalid signature)',
            );
        });

        it('should be permitted for IDaiLikePermit', async function () {
            const data = buildDataLikeDai(this.chainId, this.DaiLikePermitMock.address, await this.DaiLikePermitMock.name(), '1', wallet2, true);
            const signature = ethSigUtil.signTypedMessage(wallet.getPrivateKey(), { data });
            const { v, r, s } = fromRpcSig(signature);

            const payload = web3.eth.abi.encodeParameter(
                'tuple(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)',
                [owner, wallet2, nonce, maxDeadline, true, v, r, s],
            );
            await this.PermitableMock.__permit(this.DaiLikePermitMock.address, payload);

            const MAX_UINT128 = new BN('2').pow(new BN('128')).sub(new BN('1'));
            expect(await this.DaiLikePermitMock.nonces(owner)).to.be.bignumber.equal('1');
            expect(await this.DaiLikePermitMock.allowance(owner, wallet2)).to.be.bignumber.equal(MAX_UINT128);
        });

        it('should not be permitted for IDaiLikePermit', async function () {
            const data = buildDataLikeDai(this.chainId, this.DaiLikePermitMock.address, await this.DaiLikePermitMock.name(), '1', wallet2, true);
            const signature = ethSigUtil.signTypedMessage(wallet.getPrivateKey(), { data });
            const { v, r, s } = fromRpcSig(signature);

            const payload = web3.eth.abi.encodeParameter(
                'tuple(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)',
                [owner, wallet1, nonce, maxDeadline, true, v, r, s],
            );
              
            await expectRevert(
                this.PermitableMock.__permit(this.DaiLikePermitMock.address, payload),
                'Permit failed: Error(Dai/invalid-permit)',
            );
        });

        it('should be wrong permit length', async function () {
            const data = buildData(this.chainId, this.ERC20PermitMock.address, await this.ERC20PermitMock.name(), '1', wallet2);
            const signature = ethSigUtil.signTypedMessage(wallet.getPrivateKey(), { data });
            const { v, r, s } = fromRpcSig(signature);

            const permit = web3.eth.abi.encodeParameter(
                'tuple(address,uint256,uint256,uint8,bytes32,bytes32)',
                [wallet2, value, maxDeadline, v, r, s],
            );
            await expectRevert(
                this.PermitableMock.__permit(this.ERC20PermitMock.address, permit),
                'Wrong permit length',
            );
        });
    });
});
