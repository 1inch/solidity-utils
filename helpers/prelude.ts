import chai, {Assertion, AssertionError,assert,expect, config,should} from 'chai';
import 'chai-bn';
import chaiAsPromised from 'chai-as-promised';
import { toBN } from 'web3-utils';
chai.use(chaiAsPromised);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { time, ether } = require('@openzeppelin/test-helpers');

export const constants = {
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
    ZERO_BYTES32: '0x0000000000000000000000000000000000000000000000000000000000000000',
    MAX_UINT256: toBN('2').pow(toBN('256')).sub(toBN('1')).toString(),
    MAX_INT256: toBN('2').pow(toBN('255')).sub(toBN('1')).toString(),
    MIN_INT256: toBN('2').pow(toBN('255')).mul(toBN('-1')).toString(),
} as const;

// utils
export {
    toBN
}

//test-helpers
export {
    time,
    ether
}

// chai
export {
    Assertion,
    AssertionError,
    assert,
    expect, 
    config,
    should
}