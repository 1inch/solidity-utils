import { web3 } from 'hardhat';
import { expect } from '../../src/prelude';

const EthSenderMock = artifacts.require('EthSenderMock');
const WethReceiver = artifacts.require('WethReceiverMock');

contract('WethReceiver', function (accounts) {
    describe('WethReceiver', async function () {
        const account = accounts[0];

        beforeEach(async function () {
            this.sender = await EthSenderMock.new();
            this.receiver = await WethReceiver.new(this.sender.address);
        });

        it('contract transfer', async function () {
            await this.sender.transfer(this.receiver.address, { value: 100 });
        });

        it('normal transfer', async function () {
            await expect(
                web3.eth.sendTransaction({
                    from: account,
                    to: this.receiver.address,
                    value: 100,
                }),
            ).to.eventually.be.rejectedWith('EthDepositRejected');
        });
    });
});
