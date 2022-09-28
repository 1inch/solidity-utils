import { constants, ether, toBN } from "../../src/prelude";
import { web3 } from "hardhat";

const UniERC20Wrapper = artifacts.require("UniERC20Wrapper");
const ETHBadReceiver = artifacts.require("ETHBadReceiver");
const TokenMock = artifacts.require("TokenMock");
const ERC20Capitals = artifacts.require("ERC20Capitals");

contract("UniERC20", function (accounts) {
    describe("ERC20 token", async function () {
        const account = accounts[0];
        const account1 = accounts[1];
        const account2 = accounts[2];

        beforeEach(async function () {
            this.token = await TokenMock.new("Token", "TKN");
            this.wrapper = await UniERC20Wrapper.new(this.token.address);
            await this.token.mint(account, 10000);
        });

        it("is ETH", async function () {
            expect(await this.wrapper.isETH()).to.equal(false);
        });

        it("uni transfer", async function () {
            await this.token.transfer(this.wrapper.address, 100);
            await this.wrapper.transfer(account1, 100);
            expect(
                await this.wrapper.balanceOf(account1)
            ).to.be.bignumber.equal(toBN(100));
        });

        it("uni transfer from", async function () {
            await this.token.transfer(account1, 100);
            await this.token.approve(this.wrapper.address, 100, {
                from: account1,
            });
            await this.wrapper.transferFrom(account1, account2, 100);
            expect(
                await this.wrapper.balanceOf(account2)
            ).to.be.bignumber.equal(toBN(100));
        });

        it("uni approve", async function () {
            await this.token.transfer(this.wrapper.address, 100);
            await this.wrapper.approve(account, 100, { from: account });
            await this.token.transferFrom(this.wrapper.address, account1, 100);
            expect(
                await this.wrapper.balanceOf(account1)
            ).to.be.bignumber.equal(toBN(100));
        });

        it("uni name", async function () {
            expect(await this.wrapper.name()).to.equal("Token");
        });

        it("uni symbol", async function () {
            expect(await this.wrapper.symbol()).to.equal("TKN");
        });
    });

    describe("ERC20 token, empty name/symbol", async function () {
        beforeEach(async function () {
            this.token = await TokenMock.new("", "");
            this.wrapper = await UniERC20Wrapper.new(this.token.address);
        });

        it("uni name", async function () {
            expect(await this.wrapper.name()).to.equal("");
        });

        it("uni symbol", async function () {
            expect(await this.wrapper.symbol()).to.equal("");
        });
    });

    describe("ERC20 NAME/SYMBOL", async function () {
        beforeEach(async function () {
            this.token = await ERC20Capitals.new("Token", "TKN");
            this.wrapper = await UniERC20Wrapper.new(this.token.address);
        });

        it("uni name", async function () {
            expect(await this.wrapper.name()).to.equal("Token");
        });

        it("uni symbol", async function () {
            expect(await this.wrapper.symbol()).to.equal("TKN");
        });
    });

    describe("ETH", async function () {
        const account = accounts[0];
        const account1 = accounts[1];
        const account2 = accounts[2];

        beforeEach(async function () {
            this.wrapper = await UniERC20Wrapper.new(constants.ZERO_ADDRESS);
        });

        it("is ETH", async function () {
            expect(await this.wrapper.isETH()).to.equal(true);
        });

        it("uni transfer", async function () {
            const balBefore = toBN(await this.wrapper.balanceOf(account1));
            await this.wrapper.transfer(account1, 100, { value: 100 });
            const balAfter = toBN(await this.wrapper.balanceOf(account1));
            expect(balAfter.sub(balBefore)).to.be.bignumber.equal(toBN(100));
        });

        it("uni transfer, msg.value > amount", async function () {
            const balBefore = toBN(await this.wrapper.balanceOf(account1));
            await this.wrapper.transfer(account1, 100, { value: 101 });
            const balAfter = toBN(await this.wrapper.balanceOf(account1));
            expect(balAfter.sub(balBefore)).to.be.bignumber.equal(toBN(100));
        });

        it("uni transfer, insufficient balance", async function () {
            await expect(
                this.wrapper.transfer(account1, 100, { value: 99 })
            ).to.be.rejectedWith("InsufficientBalance");
        });

        it("uni approve must fail", async function () {
            await expect(
                this.wrapper.approve(account, 100, { from: account1 })
            ).to.be.rejectedWith("ApproveCalledOnETH");
        });

        it("uni transfer from, success", async function () {
            const balBefore = toBN(
                await this.wrapper.balanceOf(this.wrapper.address)
            );
            await this.wrapper.transferFrom(
                account,
                this.wrapper.address,
                100,
                { value: 100 }
            );
            const balAfter = toBN(
                await this.wrapper.balanceOf(this.wrapper.address)
            );
            expect(balAfter.sub(balBefore)).to.be.bignumber.equal(toBN(100));
        });

        it("uni transfer from, fail, not sender", async function () {
            await expect(
                this.wrapper.transferFrom(account, this.wrapper.address, 100, {
                    from: account1,
                    value: 100,
                })
            ).to.be.rejectedWith("FromIsNotSender");
        });

        it("uni transfer from, fail, receiver is not contract", async function () {
            await expect(
                this.wrapper.transferFrom(account, account1, 100, {
                    value: 100,
                })
            ).to.be.rejectedWith("ToIsNotThis");
        });

        it("uni name", async function () {
            expect(await this.wrapper.name()).to.equal("ETH");
        });

        it("uni symbol", async function () {
            expect(await this.wrapper.symbol()).to.equal("ETH");
        });
    });

    describe("ETH with bad ether receiver", async function () {
        const account = accounts[0];
        const account1 = accounts[1];

        beforeEach(async function () {
            this.wrapper = await UniERC20Wrapper.new(constants.ZERO_ADDRESS);
            this.receiver = await ETHBadReceiver.new(
                constants.ZERO_ADDRESS,
                this.wrapper.address
            );
        });

        it("uni failed transfer", async function () {
            await expect(
                this.wrapper.transfer(this.receiver.address, 100, {
                    value: 100,
                })
            ).to.eventually.be.rejectedWith("ETHTransferFailed");
        });

        it("uni failed transferFrom", async function () {
            await expect(
                this.receiver.transfer(this.wrapper.address, 100, {
                    value: 101,
                })
            ).to.eventually.be.rejectedWith("ETHTransferFailed");
        });
    });

    describe("ETH from special address", async function () {
        const account = accounts[0];
        const account1 = accounts[1];

        beforeEach(async function () {
            this.wrapper = await UniERC20Wrapper.new(
                "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            );
        });

        it("is ETH", async function () {
            expect(await this.wrapper.isETH()).to.equal(true);
        });
    });
});
