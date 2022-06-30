import chai, { Assertion, AssertionError, assert, expect, config, should } from 'chai';
import 'chai-bn';
import chaiAsPromised from 'chai-as-promised';
import { toWei } from 'web3-utils';
import BN from 'bn.js';
chai.use(chaiAsPromised);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { time: timeImpl } = require('@openzeppelin/test-helpers');

export function toBN (num: string | number, base?: number | 'hex'): BN {
    if (typeof(num) === 'string' && num.startsWith('0x')) {
        return new BN(num.substring(2), 16);
    }
    return new BN(num, base);
}

export const constants = {
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
    EEE_ADDRESS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    ZERO_BYTES32: '0x0000000000000000000000000000000000000000000000000000000000000000',
    MAX_UINT256: toBN('2').pow(toBN('256')).sub(toBN('1')).toString(),
    MAX_INT256: toBN('2').pow(toBN('255')).sub(toBN('1')).toString(),
    MIN_INT256: toBN('2').pow(toBN('255')).mul(toBN('-1')).toString(),
} as const;

// utils
export {
    BN,
};

//test-helpers
export type Time = {
    increaseTo: (target: string | number | BN) => Promise<BN>,
    latest: () => Promise<BN>
}

export const time: Time = timeImpl;

export function ether (n: string): BN {
    return toBN(toWei(n, 'ether'));
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
