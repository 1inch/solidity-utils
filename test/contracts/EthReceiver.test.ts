import { constants } from "../../src/prelude";
import { web3 } from "hardhat";

const EthSenderMock = artifacts.require("EthSenderMock");
const EthReceiver = artifacts.require("EthReceiverMock");

contract("EthReceiver", function (accounts) {
    describe("EthReceiver", async function () {
        const account = accounts[0];

        beforeEach(async function () {
            this.receiver = await EthReceiver.new();
            this.sender = await EthSenderMock.new();
        });

        it("contract transfer", async function () {
            await this.sender.transfer(this.receiver.address, { value: 100 });
        });

        it("normal transfer", async function () {
            await expect(
                web3.eth.sendTransaction({
                    from: account,
                    to: this.receiver.address,
                    value: 100,
                })
            ).to.eventually.be.rejectedWith("EthDepositRejected");
        });
    });
});
