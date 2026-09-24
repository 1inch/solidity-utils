import { network } from 'hardhat';

const { ethers: hhEthers, networkHelpers } = await network.getOrCreate();

export const ethers = hhEthers;
export const loadFixture = networkHelpers.loadFixture.bind(networkHelpers);
export const setCode = networkHelpers.setCode.bind(networkHelpers);
export const time = networkHelpers.time;
