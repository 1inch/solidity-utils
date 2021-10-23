const { expect } = require('chai');
const { BN, expectRevert } = require('@openzeppelin/test-helpers');

const RevertReasonParserMock = artifacts.require('RevertReasonParserMock');

function simplifyHex (hex) {
    return hex.replace(/(0x)0*([0-9a-f]*)/, '$1$2');
}

contract('RevertReasonParser', function ([wallet1, wallet2]) {
    before(async function () {
        this.RevertReasonParser = await RevertReasonParserMock.new();
    });

    describe('parse', async function () {
        it('should be parsed as Error(string)', async function () {
            const message = 'PREFIX: some error message';
            const error = web3.eth.abi.encodeFunctionCall({
                name: 'Error',
                type: 'function',
                inputs: [{
                    type: 'string',
                    name: 'error',
                }],
            }, [message]);

            expect(await this.RevertReasonParser.parse(error, 'PREFIX: '))
                .to.be.equal(`PREFIX: Error(${message})`);
        });

        it('should be reverted with Invalid revert reason', async function () {
            const message = 'PREFIX: some error message';
            const error = web3.eth.abi.encodeFunctionCall({
                name: 'Error',
                type: 'function',
                inputs: [{
                    type: 'string',
                    name: 'error',
                }],
            }, [message]);
            
            await expectRevert(
                this.RevertReasonParser.parse(error.slice(0, -14), 'PREFIX: '),
                'Invalid revert reason',
            );
        });

        it('should be parsed as Panic(uint256)', async function () {
            const message = web3.utils.toHex('PREFIX: some panic message');
            const error = web3.eth.abi.encodeFunctionCall({
                name: 'Panic',
                type: 'function',
                inputs: [{
                    type: 'uint256',
                    name: 'error',
                }],
            }, [message]);
            expect(simplifyHex(await this.RevertReasonParser.parse(error, 'PREFIX: ')))
                .to.be.equal(`PREFIX: Panic(${simplifyHex(message)})`);
        });

        it('should be parsed as Unknown(uint256)', async function () {
            const message = 'PREFIX: some unknown message';
            const error = web3.eth.abi.encodeFunctionCall({
                name: 'NotErrorOrPanic',
                type: 'function',
                inputs: [{
                    type: 'string',
                    name: 'error',
                }],
            }, [message]);
            expect(await this.RevertReasonParser.parse(error, 'PREFIX: '))
                .to.be.equal(`PREFIX: Unknown(${error})`);
        });
    });

    describe('_toHex(uint256)', async function () {
        it('should be converted', async function () {
            for (let i = 0; i < 200; i++) {
                const randomUint256 = new BN(web3.utils.randomHex(32).substr(2));
                expect(simplifyHex(await this.RevertReasonParser._toHex('0x' + randomUint256.toString(16))))
                    .to.be.equal(simplifyHex(web3.utils.toHex(randomUint256.toString())));
            }
        });
    });

    describe('_toHex(bytes)', async function () {
        it('should be converted', async function () {
            for (let i = 0; i < 200; i++) {
                const randomHex = web3.utils.randomHex(32);
                const randomBytes = web3.utils.hexToBytes(randomHex);
                expect(simplifyHex(await this.RevertReasonParser._toHex(randomBytes)))
                    .to.be.equal(simplifyHex(web3.utils.toHex(randomHex.toString())));
            }
        });
    });
});
