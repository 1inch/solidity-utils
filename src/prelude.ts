import { Assertion, AssertionError, assert, expect, config, should } from 'chai';
import { parseUnits } from 'ethers';
import { time } from '@nomicfoundation/hardhat-network-helpers';

import { use } from 'chai';
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot';
use(jestSnapshotPlugin());


export const constants = {
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
    EEE_ADDRESS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    ZERO_BYTES32: '0x0000000000000000000000000000000000000000000000000000000000000000',
    MAX_UINT256: 2n ** 256n - 1n,
    MAX_INT256: 2n ** 255n - 1n,
    MAX_UINT48: 2n ** 48n - 1n,
    MIN_INT256: -(2n ** 255n),
    MAX_UINT128: 2n ** 128n - 1n,
    MAX_UINT32: 2n ** 32n - 1n,
    DEV_CHAINS: ['hardhat', 'localhost'] as string[],
} as const;

// utils
export { time };

export function ether(n: string): bigint {
    return parseUnits(n);
}

// chai
export { Assertion, AssertionError, assert, expect, config, should };
