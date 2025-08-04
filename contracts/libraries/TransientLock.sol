// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { TransientLib, tuint256 } from "./Transient.sol";

struct TransientLock {
    tuint256 _raw;
}

library TransientLockLib {
    using TransientLib for tuint256;

    uint256 constant private _UNLOCKED = 0;
    uint256 constant private _LOCKED = 1;

    error UnexpectedLock();
    error UnexpectedUnlock();

    function lock(TransientLock storage self) internal {
        if (self._raw.inc() != _LOCKED) revert UnexpectedLock();
    }

    function isLocked(TransientLock storage self) internal view returns (bool) {
        return self._raw.tload() == _LOCKED;
    }

    function unlock(TransientLock storage self) internal {
        self._raw.dec(UnexpectedUnlock.selector);
    }

    function unlock(TransientLock storage self, bytes4 exception) internal {
        self._raw.dec(exception);
    }
}
