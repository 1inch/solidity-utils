import { expect } from '../../src/expect';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('Multicall', function () {
    async function deployMulticallMock() {
        const MulticallMock = await ethers.getContractFactory('MulticallMock');
        const mock = await MulticallMock.deploy();
        return { mock };
    }

    describe('multicall', function () {
        it('should execute single call', async function () {
            const { mock } = await loadFixture(deployMulticallMock);

            const setValueData = mock.interface.encodeFunctionData('setValue', [42]);
            await mock.multicall([setValueData]);

            expect(await mock.value()).to.equal(42n);
        });

        it('should execute multiple calls', async function () {
            const { mock } = await loadFixture(deployMulticallMock);

            const setValueData = mock.interface.encodeFunctionData('setValue', [10]);
            const incrementData = mock.interface.encodeFunctionData('increment');

            await mock.multicall([setValueData, incrementData, incrementData, incrementData]);

            expect(await mock.value()).to.equal(13n);
        });

        it('should execute empty array', async function () {
            const { mock } = await loadFixture(deployMulticallMock);
            await mock.multicall([]);
            expect(await mock.value()).to.equal(0n);
        });

        it('should preserve msg.sender in delegatecall', async function () {
            const { mock } = await loadFixture(deployMulticallMock);
            const [signer] = await ethers.getSigners();

            const setValueData = mock.interface.encodeFunctionData('setValue', [100]);
            await mock.multicall([setValueData]);

            expect(await mock.lastSender()).to.equal(signer.address);
        });

        it('should revert on failed call and forward error', async function () {
            const { mock } = await loadFixture(deployMulticallMock);

            const revertData = mock.interface.encodeFunctionData('revertWithMessage', ['test error']);

            await expect(mock.multicall([revertData]))
                .to.be.revertedWithCustomError(mock, 'CustomError')
                .withArgs('test error');
        });

        it('should revert on failed call in middle of batch', async function () {
            const { mock } = await loadFixture(deployMulticallMock);

            const setValueData = mock.interface.encodeFunctionData('setValue', [10]);
            const revertData = mock.interface.encodeFunctionData('revertWithMessage', ['middle error']);
            const incrementData = mock.interface.encodeFunctionData('increment');

            await expect(mock.multicall([setValueData, revertData, incrementData]))
                .to.be.revertedWithCustomError(mock, 'CustomError')
                .withArgs('middle error');
        });

        it('should forward empty revert', async function () {
            const { mock } = await loadFixture(deployMulticallMock);

            const revertData = mock.interface.encodeFunctionData('revertEmpty');

            await expect(mock.multicall([revertData])).to.be.reverted;
        });
    });
});
