import { network } from 'hardhat';
import type {} from '@nomicfoundation/hardhat-ethers';
import type {} from '@nomicfoundation/hardhat-network-helpers';

const { ethers: hhEthers, networkHelpers } = await network.getOrCreate();

export const ethers = hhEthers;
export const loadFixture = networkHelpers.loadFixture.bind(networkHelpers);
export const setCode = networkHelpers.setCode.bind(networkHelpers);
export const time = networkHelpers.time;
