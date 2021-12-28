const { expect } = require('chai');
const { web3 } = require('hardhat');
const { defaultDeadline, EIP712Domain, Permit, DaiLikePermit } = require('../js/permit.js');
const { trim0x, buildData, buildDataLikeDai, withTarget } = require('../js/permit.js');

const ERC20PermitMock = artifacts.require('ERC20PermitMock');
const DaiLikePermitMock = artifacts.require('DaiLikePermitMock');

describe('Methods', async () => {
    before(async () => {
        const account = await web3.eth.accounts.create();
        this.wallet = {
            address: account.address,
            privateKey: account.privateKey,
        };

        this.token = await ERC20PermitMock.new('Token', 'TKN', this.wallet.address, '1');
        this.daiLikeToken = await DaiLikePermitMock.new('DaiLikeToken', 'DLT', this.wallet.address, '1');
        this.chainId = await web3.eth.getChainId();
    });

    it('should be trimmed', async () => {
        expect(trim0x('0x123456')).to.be.equal('123456');
    });

    it('should not be changed', async () => {
        expect(trim0x('123456')).to.be.equal('123456');
    });

    it('should correctly build data for permit', async () => {
        const data = buildData(await this.token.name(), '1', this.chainId, this.token.address, this.wallet.address, this.wallet.address, '1', '1');
        expect(data).to.be.deep.equal({
            primaryType: 'Permit',
            types: {
                EIP712Domain: EIP712Domain,
                Permit: Permit,
            },
            domain: {
                name: await this.token.name(),
                version: '1',
                chainId: 31337,
                verifyingContract: this.token.address,
            },
            message: {
                owner: this.wallet.address,
                spender: this.wallet.address,
                value: '1',
                nonce: '1',
                deadline: defaultDeadline,
            },
        });
    });

    it('should correctly build data for dai-like permit', async () => {
        const data = buildDataLikeDai(await this.daiLikeToken.name(), '1', this.chainId, this.daiLikeToken.address, this.wallet.address, this.wallet.address, '1', true);
        expect(data).to.be.deep.equal({
            primaryType: 'Permit',
            types: {
                EIP712Domain: EIP712Domain,
                Permit: DaiLikePermit,
            },
            domain: {
                name: await this.daiLikeToken.name(),
                version: '1',
                chainId: 31337,
                verifyingContract: this.daiLikeToken.address,
            },
            message: {
                holder: this.wallet.address,
                spender: this.wallet.address,
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
