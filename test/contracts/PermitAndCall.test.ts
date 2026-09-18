import { getNetworkConnection } from '../../src/network.js';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import { expect } from '../../src/expect.js';
import { getPermit, trim0x } from '../../src/permit.js';
import { PermitAndCallMock } from '../../typechain-types/index.js';

const { ethers, networkHelpers } = await getNetworkConnection();


const value = 42n;

describe('Permitable', function () {
    let signer1: HardhatEthersSigner;
    let signer2: HardhatEthersSigner;

    before(async function () {
        [signer1, signer2] = await ethers.getSigners();
    });

    async function deployTokens() {
        const PermitAndCallMockFactory = await ethers.getContractFactory('PermitAndCallMock');
        const ERC20PermitMockFactory = await ethers.getContractFactory('ERC20PermitMock');

        const chainId = Number((await ethers.provider.getNetwork()).chainId);
        const permitAndCallMock = <PermitAndCallMock><unknown> await PermitAndCallMockFactory.deploy();
        const erc20PermitMock = await ERC20PermitMockFactory.deploy('USDC', 'USDC', signer1, 100n);
        return { permitAndCallMock, erc20PermitMock, chainId };
    }

    it('should work with valid permit', async function () {
        const { permitAndCallMock, erc20PermitMock, chainId } = await networkHelpers.loadFixture(deployTokens);
        const permit = await getPermit(signer1, erc20PermitMock, '1', chainId, await permitAndCallMock.getAddress(), value.toString(), 0x8fffffff.toString(), true);
        const tx = await permitAndCallMock.permitAndCall(erc20PermitMock.target + trim0x(permit), (await permitAndCallMock.foo.populateTransaction()).data);
        await expect(tx).to.emit(permitAndCallMock, 'FooCalled');
        expect(await erc20PermitMock.allowance(signer1.address, permitAndCallMock.target)).to.equal(value);
    });

    it('should work with invalid permit', async function () {
        const { permitAndCallMock, erc20PermitMock, chainId } = await networkHelpers.loadFixture(deployTokens);
        const badPermit = await getPermit(signer1, erc20PermitMock, '2', chainId, await permitAndCallMock.getAddress(), value.toString(), 0x8fffffff.toString(), true);
        const tx = await permitAndCallMock.permitAndCall(erc20PermitMock.target + trim0x(badPermit), (await permitAndCallMock.foo.populateTransaction()).data);
        await expect(tx).to.emit(permitAndCallMock, 'FooCalled');
        expect(await erc20PermitMock.allowance(signer1.address, permitAndCallMock.target)).to.equal(0);
    });

    it('should work with nested permit', async function () {
        const { permitAndCallMock, erc20PermitMock, chainId } = await networkHelpers.loadFixture(deployTokens);
        const permit1 = await getPermit(signer1, erc20PermitMock, '1', chainId, await permitAndCallMock.getAddress(), value.toString(), 0x8fffffff.toString(), true);
        const permit2 = await getPermit(signer2, erc20PermitMock, '1', chainId, await permitAndCallMock.getAddress(), value.toString(), 0x8fffffff.toString(), false);
        const fooCall = (await permitAndCallMock.foo.populateTransaction()).data;
        const innerPermitCalldata = (await permitAndCallMock.permitAndCall.populateTransaction(erc20PermitMock.target + trim0x(permit2), fooCall)).data;
        const tx = await permitAndCallMock.permitAndCall(erc20PermitMock.target + trim0x(permit1), innerPermitCalldata);
        await expect(tx).to.emit(permitAndCallMock, 'FooCalled');
        expect(await erc20PermitMock.allowance(signer1.address, permitAndCallMock.target)).to.equal(value);
        expect(await erc20PermitMock.allowance(signer2.address, permitAndCallMock.target)).to.equal(value);
    });

    it('should work with payable function', async function () {
        const { permitAndCallMock, erc20PermitMock, chainId } = await networkHelpers.loadFixture(deployTokens);
        const permit = await getPermit(signer1, erc20PermitMock, '1', chainId, await permitAndCallMock.getAddress(), value.toString(), 0x8fffffff.toString(), true);
        const tx = await permitAndCallMock.permitAndCall(erc20PermitMock.target + trim0x(permit), (await permitAndCallMock.payableFoo.populateTransaction()).data, { value: 1n });
        await expect(tx).to.emit(permitAndCallMock, 'MsgValue').withArgs(1n);
        expect(await erc20PermitMock.allowance(signer1.address, permitAndCallMock.target)).to.equal(value);
    });

    it('should work with payable function and nested permit', async function () {
        const { permitAndCallMock, erc20PermitMock, chainId } = await networkHelpers.loadFixture(deployTokens);
        const permit1 = await getPermit(signer1, erc20PermitMock, '1', chainId, await permitAndCallMock.getAddress(), value.toString(), 0x8fffffff.toString(), true);
        const permit2 = await getPermit(signer2, erc20PermitMock, '1', chainId, await permitAndCallMock.getAddress(), value.toString(), 0x8fffffff.toString(), false);
        const fooCall = (await permitAndCallMock.payableFoo.populateTransaction()).data;
        const innerPermitCalldata = (await permitAndCallMock.permitAndCall.populateTransaction(erc20PermitMock.target + trim0x(permit2), fooCall)).data;
        const tx = await permitAndCallMock.permitAndCall(erc20PermitMock.target + trim0x(permit1), innerPermitCalldata, { value: 1n });
        await expect(tx).to.emit(permitAndCallMock, 'MsgValue').withArgs(1n);
        expect(await erc20PermitMock.allowance(signer1.address, permitAndCallMock.target)).to.equal(value);
        expect(await erc20PermitMock.allowance(signer2.address, permitAndCallMock.target)).to.equal(value);
    });
});
