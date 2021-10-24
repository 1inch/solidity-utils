const { expect } = require('chai');
const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const { promisify } = require('util');

const RevertReasonParserMock = artifacts.require('RevertReasonParserMock');

function simplifyHex (hex) {
    return hex.replace(/(0x)0*([0-9a-f]*)/, function (_, p1, p2) { return p1 + p2.toUpperCase(); });
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
                .to.be.equal(`PREFIX: Unknown(${simplifyHex(error)})`);
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

    describe('_toHex16(bytes16)', async function () {
        it('should be converted test1', async function () {
            expect(simplifyHex(await this.RevertReasonParser._toHex16(web3.utils.numberToHex(1))))
                .to.be.equal('0x3130303030303030303030303030303030303030303030303030303030303030');
        });

        it('should be converted test2', async function () {
            expect(simplifyHex(await this.RevertReasonParser._toHex16('0xbb85482cd85d616a6c5984c094a0e34c')))
                .to.be.equal('0x4242383534383243443835443631364136433539383443303934413045333443');
        });

        it('should be converted test3', async function () {
            expect(simplifyHex(await this.RevertReasonParser._toHex16('0x84b2376c373f719e0f171bab2faac687')))
                .to.be.equal('0x3834423233373643333733463731394530463137314241423246414143363837');
        });

        it('should be converted test4', async function () {
            expect(simplifyHex(await this.RevertReasonParser._toHex16('0x24a1d5eed0d00a03daa55de71be1323d')))
                .to.be.equal('0x3234413144354545443044303041303344414135354445373142453133323344');
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

        it('should be cheap', async function () {
            const randomHex = web3.utils.randomHex(32);
            const randomBytes = web3.utils.hexToBytes(randomHex);
            const receipt = await this.RevertReasonParser._toHexEfficiencyTest(randomBytes);
            const trace = await promisify(web3.currentProvider.send.bind(web3.currentProvider))({
                jsonrpc: '2.0',
                method: 'debug_traceTransaction',
                params: [receipt.tx, {}],
                id: new Date().getTime(),
            });
            // in prev version method costs 48101 gas
            expect(trace.result.gas).to.be.lt(48101);
        });
    });
});
