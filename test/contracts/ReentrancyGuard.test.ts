import { expect } from '../../src/expect';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('ReentrancyGuard', function () {
    async function deployReentrancyGuardMock() {
        const ReentrancyGuardMock = await ethers.getContractFactory('ReentrancyGuardMock');
        const mock = await ReentrancyGuardMock.deploy();

        const ReentrancyAttacker = await ethers.getContractFactory('ReentrancyAttacker');
        const attacker = await ReentrancyAttacker.deploy(await mock.getAddress());

        return { mock, attacker };
    }

    describe('nonReentrant modifier', function () {
        it('should allow normal function call', async function () {
            const { mock } = await loadFixture(deployReentrancyGuardMock);
            await mock.protectedIncrement();
            expect(await mock.counter()).to.equal(1n);
        });

        it('should allow multiple sequential calls', async function () {
            const { mock } = await loadFixture(deployReentrancyGuardMock);
            await mock.protectedIncrement();
            await mock.protectedIncrement();
            await mock.protectedIncrement();
            expect(await mock.counter()).to.equal(3n);
        });

        it('should prevent reentrancy attack', async function () {
            const { mock, attacker } = await loadFixture(deployReentrancyGuardMock);

            await expect(mock.protectedIncrementAndCall(await attacker.getAddress()))
                .to.be.revertedWithCustomError(mock, 'UnexpectedLock');
        });
    });

    describe('onlyNonReentrantCall modifier', function () {
        it('should allow call within nonReentrant context', async function () {
            const { mock } = await loadFixture(deployReentrancyGuardMock);
            await mock.callOnlyInProtectedContext();
            expect(await mock.counter()).to.equal(1n);
        });

        it('should revert when called outside nonReentrant context', async function () {
            const { mock } = await loadFixture(deployReentrancyGuardMock);
            await expect(mock.callOnlyInProtectedContextWithoutGuard())
                .to.be.revertedWithCustomError(mock, 'MissingNonReentrantModifier');
        });
    });

    describe('_inNonReentrantCall', function () {
        it('should return false when not in protected context', async function () {
            const { mock } = await loadFixture(deployReentrancyGuardMock);
            expect(await mock.inNonReentrantCall()).to.equal(false);
        });

        it('should return true when in protected context', async function () {
            const { mock } = await loadFixture(deployReentrancyGuardMock);
            expect(await mock.checkInNonReentrantCall.staticCall()).to.equal(true);
        });
    });

    describe('transient behavior', function () {
        it('should reset lock between transactions', async function () {
            const { mock } = await loadFixture(deployReentrancyGuardMock);
            await mock.protectedIncrement();
            // Lock should be released, so next call should work
            await mock.protectedIncrement();
            expect(await mock.counter()).to.equal(2n);
        });
    });
});
