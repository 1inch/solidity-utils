import { ethers, loadFixture } from '../../src/hardhatHelpers.js';
import { expect } from '../../src/expect.js';



describe('TransientAtMock', function () {
    async function deployMock() {
        const mock = await (await ethers.getContractFactory('TransientAtMock')).deploy();
        return { mock };
    }

    it('should not collide with native transient storage', async function () {
        const { mock } = await loadFixture(deployMock);
        const nativeValue = ethers.id('native value');
        const updatedNativeValue = ethers.id('updated native value');
        const results = await mock.multicall.staticCall([
            mock.interface.encodeFunctionData('tstoreNative', [nativeValue]),
            mock.interface.encodeFunctionData('tstoreUint', [42n]),
            mock.interface.encodeFunctionData('nativeTransient'),
            mock.interface.encodeFunctionData('tloadUint'),
            mock.interface.encodeFunctionData('tstoreUint', [43n]),
            mock.interface.encodeFunctionData('nativeTransient'),
            mock.interface.encodeFunctionData('tstoreNative', [updatedNativeValue]),
            mock.interface.encodeFunctionData('tloadUint'),
            mock.interface.encodeFunctionData('nativeTransient'),
        ]);

        expect(mock.interface.decodeFunctionResult('nativeTransient', results[2])[0]).to.equal(nativeValue);
        expect(mock.interface.decodeFunctionResult('tloadUint', results[3])[0]).to.equal(42n);
        expect(mock.interface.decodeFunctionResult('nativeTransient', results[5])[0]).to.equal(nativeValue);
        expect(mock.interface.decodeFunctionResult('tloadUint', results[7])[0]).to.equal(43n);
        expect(mock.interface.decodeFunctionResult('nativeTransient', results[8])[0]).to.equal(updatedNativeValue);
    });
});
