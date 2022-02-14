import { expect } from 'chai';
import 'chai-bn';
const { time, ether, BN } = require('@openzeppelin/test-helpers');
import { timeIncreaseTo, fixSignature, signMessage, trackReceivedTokenAndTx, countInstructions } from '../testHelpers/utils';
const TokenMock = artifacts.require('TokenMock');

describe('timeIncreaseTo', async function () {
    const precision = 2;

    async function shouldIncrease (secs: number) {
        const timeBefore = await time.latest();
        await timeIncreaseTo(timeBefore.addn(secs));
        const timeAfter = await time.latest();

        expect(timeAfter).to.be.bignumber.gt(timeBefore);
        expect(timeAfter.sub(timeBefore)).to.be.bignumber.lte(new BN(secs).addn(precision));
        expect(timeAfter.sub(timeBefore)).to.be.bignumber.gte(new BN(secs));
    }

    it('should be increased on 1000 sec', async function () {
        await shouldIncrease(1000);
    });

    it('should be increased on 2000 sec', async function () {
        await shouldIncrease(2000);
    });

    it('should be increased on 1000000 sec', async function () {
        await shouldIncrease(1000000);
    });

    it('should be thrown with increase time to a moment in the past', async function () {
        try {
            await shouldIncrease(-1000);
        } catch (e: any) {
            expect(e.message).contains('Cannot increase current time');
            expect(e.message).contains('to a moment in the past');
            return;
        }
        expect(true).equal(false);
    });
});

describe('fixSignature', async function () {
    it('should not be fixed geth sign', async function () {
        const signature = '0xb453386b73ba5608314e9b4c7890a4bd12cc24c2c7bdf5f87778960ff85c56a8520dabdbea357fc561120dd2625bd8a904f35bdb4b153cf706b6ff25bb0d898d1c';
        expect(signature).equal(fixSignature(signature));
    });

    it('should be fixed ganache sign', async function () {
        const signature = '0x511fafdf71306ff89a063a76b52656c18e9a7d80d19e564c90f0126f732696bb673cde46003aad0ccb6dab2ca91ae38b82170824b0725883875194b273f709b901';
        const v = parseInt(signature.slice(130, 132), 16) + 27;
        const vHex = v.toString(16);
        expect(signature.slice(0, 130) + vHex).equal(fixSignature(signature));
    });
});

contract('', function ([wallet1, wallet2]) {
    const initContext = async () => {
        const USDT = await TokenMock.new('USDT', 'USDT');
        const USDC = await TokenMock.new('USDC', 'USDC');
        return { USDT, USDC };
    }

    let context: Awaited<ReturnType<typeof initContext>> = undefined!;

    before(async () => {
        context = await initContext();
    });

    beforeEach(async function () {
        for (const addr of [wallet1, wallet2]) {
            for (const token of [context.USDT, context.USDC]) {
                await token.mint(addr, ether('1000'));
            }
        }
    });

    describe('signMessage', async function () {
        it('should be signed test1', async function () {
            expect(await web3.eth.sign('0x', wallet1)).equal(await signMessage(wallet1));
        });

        it('should be signed test2', async function () {
            const message = web3.utils.randomHex(32);
            expect(await web3.eth.sign(message, wallet1)).equal(await signMessage(wallet1, message));
        });

        it('should be signed test3', async function () {
            const message = web3.utils.toHex('Test message'); ;
            expect(await web3.eth.sign(message, wallet1)).equal(await signMessage(wallet1, message));
        });
    });

    describe('trackReceivedTokenAndTx', async function () {
        it('should be tracked ERC20 Transfer', async function () {
            const [received, tx] = await trackReceivedTokenAndTx(
                context.USDT,
                wallet2,
                () => context.USDT.transfer(wallet2, ether('1'), { from: wallet1 }),
            );
            expect(received).to.be.bignumber.equal(ether('1'));
            expect(tx.tx.length).equal(66);
            expect(tx.receipt.from).equal(wallet1.toLowerCase());
            expect(tx.receipt.to).equal(context.USDT.address.toLowerCase());
            expect(tx.logs.length).equal(1);
            expect(tx.logs[0].event).equal('Transfer');
        });

        it('should be tracked ERC20 Approve', async function () {
            const [received, tx] = await trackReceivedTokenAndTx(
                context.USDT,
                wallet2,
                () => context.USDT.approve(wallet2, ether('1'), { from: wallet1 }),
            );
            expect(received).to.be.bignumber.equal('0');
            expect(tx.tx.length).equal(66);
            expect(tx.receipt.from).equal(wallet1.toLowerCase());
            expect(tx.receipt.to).equal(context.USDT.address.toLowerCase());
            expect(tx.logs.length).equal(1);
            expect(tx.logs[0].event).equal('Approval');
        });
    });

    describe('trackReceivedToken', async function () {
        it('should be tracked ERC20 Transfer', async function () {
            const received = await trackReceivedTokenAndTx(
                context.USDT,
                wallet2,
                () => context.USDT.transfer(wallet2, ether('1'), { from: wallet1 }),
            );
            expect(received).to.be.bignumber.equal(ether('1'));
        });

        it('should be tracked ERC20 Approve', async function () {
            const received = await trackReceivedTokenAndTx(
                context.USDT,
                wallet2,
                () => context.USDT.approve(wallet2, ether('1'), { from: wallet1 }),
            );
            expect(received).to.be.bignumber.equal('0');
        });
    });

    describe('countInstructions', async function () {
        it('should be counted ERC20 Transfer', async function () {
            const [, tx] = await trackReceivedTokenAndTx(
                context.USDT,
                wallet2,
                () => context.USDT.transfer(wallet2, ether('1'), { from: wallet1 }),
            );
            expect(await countInstructions(tx.receipt.transactionHash, ['STATICCALL', 'CALL', 'SSTORE', 'SLOAD']))
                .to.be.deep.equal([0, 0, 2, 2]);
        });

        it('should be counted ERC20 Approve', async function () {
            const [, tx] = await trackReceivedTokenAndTx(
                context.USDT,
                wallet2,
                () => context.USDT.approve(wallet2, ether('1'), { from: wallet1 }),
            );
            expect(await countInstructions(tx.receipt.transactionHash, ['STATICCALL', 'CALL', 'SSTORE', 'SLOAD']))
                .to.be.deep.equal([0, 0, 1, 0]);
        });
    });
});
