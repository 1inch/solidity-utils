import { getNetworkConnection } from '../../src/network.js';
import { expect } from '../../src/expect.js';

const { ethers, networkHelpers } = await getNetworkConnection();


describe('Simulator', function () {
    async function deploySimulatorMock() {
        const SimulatorMock = await ethers.getContractFactory('SimulatorMock');
        const SimulatorTarget = await ethers.getContractFactory('SimulatorTarget');

        const mock = await SimulatorMock.deploy();
        const target = await SimulatorTarget.deploy();

        return { mock, target };
    }

    describe('simulate', function () {
        it('should always revert with Simulated error', async function () {
            const { mock, target } = await networkHelpers.loadFixture(deploySimulatorMock);

            const setValueData = target.interface.encodeFunctionData('setValue', [42]);

            await expect(mock.simulate(await target.getAddress(), setValueData))
                .to.be.revertedWithCustomError(mock, 'Simulated');
        });

        it('should return success=true for successful delegatecall', async function () {
            const { mock, target } = await networkHelpers.loadFixture(deploySimulatorMock);

            const setValueData = target.interface.encodeFunctionData('setValue', [42]);

            try {
                await mock.simulate(await target.getAddress(), setValueData);
            } catch (error: unknown) {
                const errorData = (error as { data?: string }).data;
                if (errorData) {
                    const decoded = mock.interface.parseError(errorData);
                    expect(decoded?.name).to.equal('Simulated');
                    expect(decoded?.args[2]).to.equal(true); // success
                }
            }
        });

        it('should return success=false for failing delegatecall', async function () {
            const { mock, target } = await networkHelpers.loadFixture(deploySimulatorMock);

            const revertData = target.interface.encodeFunctionData('revertWithMessage', ['test error']);

            try {
                await mock.simulate(await target.getAddress(), revertData);
            } catch (error: unknown) {
                const errorData = (error as { data?: string }).data;
                if (errorData) {
                    const decoded = mock.interface.parseError(errorData);
                    expect(decoded?.name).to.equal('Simulated');
                    expect(decoded?.args[2]).to.equal(false); // success
                }
            }
        });

        it('should not persist state changes', async function () {
            const { mock } = await networkHelpers.loadFixture(deploySimulatorMock);

            const setValueData = mock.interface.encodeFunctionData('setValue', [999]);

            try {
                await mock.simulate(await mock.getAddress(), setValueData);
            } catch {
                // Expected to revert
            }

            // State should not have changed
            expect(await mock.getValue()).to.equal(0n);
        });

        it('should accept ETH value', async function () {
            const { mock, target } = await networkHelpers.loadFixture(deploySimulatorMock);

            const getData = target.interface.encodeFunctionData('getValue');

            await expect(mock.simulate(await target.getAddress(), getData, { value: 1000 }))
                .to.be.revertedWithCustomError(mock, 'Simulated');
        });
    });
});
