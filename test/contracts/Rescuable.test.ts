import { expect } from '../../src/expect';
import { ether } from '../../src/prelude';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import type { RescuableMock } from '../../typechain-types/contracts/tests/mocks/RescuableMock';
import type { NoReceiveOwnerMock } from '../../typechain-types/contracts/tests/mocks/NoReceiveOwnerMock';

describe('Rescuable', function () {
    let owner: SignerWithAddress;
    let nonOwner: SignerWithAddress;

    before(async function () {
        [owner, nonOwner] = await ethers.getSigners();
    });

    async function deployRescuableMock() {
        const RescuableMockFactory = await ethers.getContractFactory('RescuableMock');
        const mock = await RescuableMockFactory.deploy(owner.address) as unknown as RescuableMock;

        const TokenMock = await ethers.getContractFactory('TokenMock');
        const token = await TokenMock.deploy('Test Token', 'TT');

        return { mock, token };
    }

    describe('rescueFunds ERC20', function () {
        it('should rescue ERC20 tokens to owner', async function () {
            const { mock, token } = await loadFixture(deployRescuableMock);
            const amount = ether('50');
            await token.mint(mock, amount);

            const ownerBalanceBefore = await token.balanceOf(owner.address);
            await mock.rescueFunds(token, amount);
            expect(await token.balanceOf(owner.address)).to.equal(ownerBalanceBefore + amount);
            expect(await token.balanceOf(mock)).to.equal(0n);
        });

        it('should rescue partial ERC20 balance', async function () {
            const { mock, token } = await loadFixture(deployRescuableMock);
            const total = ether('100');
            const rescue = ether('40');
            await token.mint(mock, total);

            await mock.rescueFunds(token, rescue);
            expect(await token.balanceOf(mock)).to.equal(total - rescue);
        });

        it('should revert when called by non-owner', async function () {
            const { mock, token } = await loadFixture(deployRescuableMock);
            await expect(
                mock.connect(nonOwner).rescueFunds(token, ether('1')),
            ).to.be.revertedWithCustomError(mock, 'OwnableUnauthorizedAccount');
        });

        it('should revert when token transfer returns false', async function () {
            const { mock } = await loadFixture(deployRescuableMock);
            const ERC20ReturnFalseMock = await ethers.getContractFactory('ERC20ReturnFalseMock');
            const badToken = await ERC20ReturnFalseMock.deploy();

            await expect(
                mock.rescueFunds(badToken, ether('1')),
            ).to.be.revertedWithCustomError(mock, 'SafeTransferFailed');
        });
    });

    describe('rescueFunds ETH', function () {
        it('should rescue native ETH to owner', async function () {
            const { mock } = await loadFixture(deployRescuableMock);
            const amount = ether('1');
            await owner.sendTransaction({ to: mock, value: amount });

            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
            const tx = await mock.rescueFunds(ethers.ZeroAddress, amount);
            const receipt = await tx.wait();
            const gasCost = receipt!.gasUsed * receipt!.gasPrice;

            expect(await ethers.provider.getBalance(owner.address)).to.equal(
                ownerBalanceBefore + amount - gasCost,
            );
            expect(await ethers.provider.getBalance(mock)).to.equal(0n);
        });

        it('should rescue partial ETH balance', async function () {
            const { mock } = await loadFixture(deployRescuableMock);
            const total = ether('2');
            const rescue = ether('1');
            await owner.sendTransaction({ to: mock, value: total });

            await mock.rescueFunds(ethers.ZeroAddress, rescue);
            expect(await ethers.provider.getBalance(mock)).to.equal(total - rescue);
        });

        it('should revert when called by non-owner', async function () {
            const { mock } = await loadFixture(deployRescuableMock);
            await owner.sendTransaction({ to: mock, value: ether('1') });

            await expect(
                mock.connect(nonOwner).rescueFunds(ethers.ZeroAddress, ether('1')),
            ).to.be.revertedWithCustomError(mock, 'OwnableUnauthorizedAccount');
        });

        it('should revert when owner cannot receive ETH', async function () {
            const { mock } = await loadFixture(deployRescuableMock);
            const amount = ether('1');
            await owner.sendTransaction({ to: mock, value: amount });

            const NoReceiveOwnerMockFactory = await ethers.getContractFactory('NoReceiveOwnerMock');
            const noReceiveOwner = await NoReceiveOwnerMockFactory.deploy(mock) as unknown as NoReceiveOwnerMock;

            await mock.transferOwnership(noReceiveOwner);

            await expect(
                noReceiveOwner.rescueFunds(ethers.ZeroAddress, amount),
            ).to.be.revertedWithCustomError(mock, 'ETHTransferFailed');
        });
    });
});
