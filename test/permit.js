const { expect } = require('chai');
const { web3 } = require('hardhat');
const { defaultDeadline, EIP712Domain, Permit, DaiLikePermit } = require('../js/permit.js');
const { trim0x, domainSeparator, buildData, buildDataLikeDai, getPermit, getPermitLikeDai, withTarget } = require('../js/permit.js');

const ERC20PermitMock = artifacts.require('ERC20PermitMock');
const DaiLikePermitMock = artifacts.require('DaiLikePermitMock');

describe('Constants', async () => {
    it('should be defaultDeadline', async () => {
        expect(defaultDeadline).to.be.bignumber.equal('115792089237316195423570985008687907853269984665640564039457584007913129639935');
    });
    
    it('should be EIP712Domain', async () => {
        expect(EIP712Domain).deep.to.equal([
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
        ]);
    });

    it('should be Permit', async () => {
        expect(Permit).deep.to.equal([
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
        ]);
    });

    it('should be DaiLikePermit', async () => {
        expect(DaiLikePermit).deep.to.equal([
            { name: 'holder', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'nonce', type: 'uint256' },
            { name: 'expiry', type: 'uint256' },
            { name: 'allowed', type: 'bool' },
        ]);
    });
});

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

    it('should be return domainSeparator', async () => {
        const ds = domainSeparator(await this.token.name(), '1', this.chainId, this.token.address);
        expect(ds.length).to.be.equal(66);
    });

    it('should be return builded data for permit', async () => {
        const data = buildData(await this.token.name(), '1', this.chainId, this.token.address, this.wallet.address, this.wallet.address, '1', '1');
        expect(data).deep.to.equal({
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

    it('should be return builded data for permit like dai', async () => {
        const data = buildDataLikeDai(await this.daiLikeToken.name(), '1', this.chainId, this.daiLikeToken.address, this.wallet.address, this.wallet.address, '1', true);
        expect(data).deep.to.equal({
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

    it('should be return permit data', async () => {
        const permit = await getPermit(this.wallet.address, this.wallet.privateKey, this.token, '1', this.chainId, this.wallet.address, '1');
        expect(permit.length).to.be.equal(450);
        // extend test see in Permitable.test.js - should be permitted for IERC20Permit
    });

    it('should be return permit like dai data', async () => {
        const permit = await getPermitLikeDai(this.wallet.address, this.wallet.privateKey, this.daiLikeToken, '1', this.chainId, this.wallet.address, true);
        expect(permit.length).to.be.equal(514);
        // extend test see in Permitable.test.js - should be permitted for IDaiLikePermit
    });

    it('should be join trimmed data to target', async () => {
        expect(withTarget('123456', '0x123456')).to.be.equal('123456123456');
    });

    it('should be join data to target', async () => {
        expect(withTarget('123456', '123456')).to.be.equal('123456123456');
    });
});
