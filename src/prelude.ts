import { Assertion, AssertionError, assert, expect, config, should } from 'chai';
import { toWei } from 'web3-utils';
import { time } from '@nomicfoundation/hardhat-network-helpers';

export const constants = {
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
    EEE_ADDRESS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    ZERO_BYTES32: '0x0000000000000000000000000000000000000000000000000000000000000000',
    MAX_UINT256: (2n ** 256n) - 1n,
    MAX_INT256: (2n ** 255n) - 1n,
    MIN_INT256: -(2n ** 255n),
    MAX_UINT128: (2n ** 128n) - 1n,
} as const;

// utils
export {
    time,
};

export function ether (n: string): bigint {
    return BigInt(toWei(n, 'ether'));
}

// chai
export {
    Assertion,
    AssertionError,
    assert,
    expect,
    config,
    should,
};
