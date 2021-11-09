const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');

const AddressSetMock = artifacts.require('AddressSetMock');

contract('AddressSet', async function ([wallet1, wallet2, wallet3]) {
    beforeEach(async function () {
        this.AddressSetMock = await AddressSetMock.new();
    });

    describe('length', async function () {
        it('should be calculate length 0', async function () {
            expect(await this.AddressSetMock.length()).to.be.bignumber.equal('0');
        });

        it('should be calculate length 1', async function () {
            await this.AddressSetMock.add(wallet1);
            expect(await this.AddressSetMock.length()).to.be.bignumber.equal('1');
        });
    });

    describe('at', async function () {
        it('should be get from empty data', async function () {
            expect(await this.AddressSetMock.at(0)).to.be.equal(constants.ZERO_ADDRESS);
            expect(await this.AddressSetMock.at(1)).to.be.equal(constants.ZERO_ADDRESS);
        });

        it('should be get from data with 1 element', async function () {
            await this.AddressSetMock.add(wallet1);
            expect(await this.AddressSetMock.at(0)).to.be.equal(wallet1);
            expect(await this.AddressSetMock.at(1)).to.be.equal(constants.ZERO_ADDRESS);
        });

        it('should be get from data with several elements', async function () {
            await this.AddressSetMock.add(wallet1);
            await this.AddressSetMock.add(wallet2);
            expect(await this.AddressSetMock.at(0)).to.be.equal(wallet1);
            expect(await this.AddressSetMock.at(1)).to.be.equal(wallet2);
        });
    });

    describe('contains', async function () {
        it('should be not contains in empty data', async function () {
            expect(await this.AddressSetMock.contains(wallet1)).to.be.equal(false);
            expect(await this.AddressSetMock.contains(wallet2)).to.be.equal(false);
            expect(await this.AddressSetMock.contains(constants.ZERO_ADDRESS)).to.be.equal(false);
        });

        it('should be contains address', async function () {
            await this.AddressSetMock.add(wallet1);
            expect(await this.AddressSetMock.contains(wallet1)).to.be.equal(true);
            expect(await this.AddressSetMock.contains(wallet2)).to.be.equal(false);
            expect(await this.AddressSetMock.contains(constants.ZERO_ADDRESS)).to.be.equal(false);
        });

        it('should be contains addresses', async function () {
            await this.AddressSetMock.add(wallet1);
            await this.AddressSetMock.add(wallet2);
            expect(await this.AddressSetMock.contains(wallet1)).to.be.equal(true);
            expect(await this.AddressSetMock.contains(wallet2)).to.be.equal(true);
            expect(await this.AddressSetMock.contains(wallet3)).to.be.equal(false);
            expect(await this.AddressSetMock.contains(constants.ZERO_ADDRESS)).to.be.equal(false);
        });
    });

    describe('add', async function () {
        it('should be add to empty data', async function () {
            const isAdded = await this.AddressSetMock.add.call(wallet1);
            await this.AddressSetMock.add(wallet1);
            expect(await this.AddressSetMock.contains(wallet1)).to.be.equal(isAdded);
        });

        it('should not be add a double element without another elements in data', async function () {
            await this.AddressSetMock.add(wallet1);
            expect(await this.AddressSetMock.add.call(wallet1)).to.be.equal(false);
        });

        it('should be add to data with 1 element', async function () {
            await this.AddressSetMock.add(wallet1);
            const isAdded = await this.AddressSetMock.add.call(wallet2);
            await this.AddressSetMock.add(wallet2);
            expect(await this.AddressSetMock.contains(wallet2)).to.be.equal(isAdded);
        });

        it('should not be add a double element with another elements in data', async function () {
            await this.AddressSetMock.add(wallet1);
            await this.AddressSetMock.add(wallet2);
            expect(await this.AddressSetMock.add.call(wallet2)).to.be.equal(false);
        });
    });

    describe('remove', async function () {
        it('should not be remove from empty data', async function () {
            const isRemoved = await this.AddressSetMock.remove.call(wallet1);
            expect(isRemoved).to.be.equal(false);
        });

        it('should be remove from data', async function () {
            await this.AddressSetMock.add(wallet1);
            const isRemoved = await this.AddressSetMock.remove.call(wallet1);
            await this.AddressSetMock.remove(wallet1);
            expect(isRemoved).to.be.equal(true);
            expect(await this.AddressSetMock.contains(wallet1)).to.be.equal(false);
        });

        it('should not be remove element which is not in data', async function () {
            await this.AddressSetMock.add(wallet1);
            const isRemoved = await this.AddressSetMock.remove.call(wallet2);
            expect(isRemoved).to.be.equal(false);
        });

        it('should be remove from data and keep the remainder', async function () {
            await this.AddressSetMock.add(wallet1);
            await this.AddressSetMock.add(wallet2);
            const isRemoved = await this.AddressSetMock.remove.call(wallet1);
            await this.AddressSetMock.remove(wallet1);
            expect(isRemoved).to.be.equal(true);
            expect(await this.AddressSetMock.contains(wallet1)).to.be.equal(false);
            expect(await this.AddressSetMock.contains(wallet2)).to.be.equal(true);
        });
    });
});
