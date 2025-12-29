// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { TransientLib, tuint256 } from "./Transient.sol";

/**
 * @title TransientLock
 * @dev Struct representing a transient storage-based lock for reentrancy protection.
 */
struct TransientLock {
    tuint256 _raw;
}

/**
 * @title TransientLockLib
 * @dev Library for managing transient storage locks.
 * Provides gas-efficient reentrancy protection using EIP-1153 transient storage.
 */
library TransientLockLib {
    using TransientLib for tuint256;

    /**
     * @dev Error thrown when attempting to lock an already locked state.
     */
    error UnexpectedLock();

    /**
     * @dev Error thrown when attempting to unlock a non-locked state.
     */
    error UnexpectedUnlock();

    uint256 constant private _UNLOCKED = 0;
    uint256 constant private _LOCKED = 1;

    /**
     * @dev Acquires the lock. Reverts with UnexpectedLock if already locked.
     * @param self The transient lock to acquire.
     */
    function lock(TransientLock storage self) internal {
        require(self._raw.inc() == _LOCKED, UnexpectedLock());
    }

    /**
     * @dev Releases the lock. Reverts with UnexpectedUnlock if not currently locked.
     * @param self The transient lock to release.
     */
    function unlock(TransientLock storage self) internal {
        self._raw.dec(UnexpectedUnlock.selector);
    }

    /**
     * @dev Checks if the lock is currently held.
     * @param self The transient lock to check.
     * @return True if the lock is held, false otherwise.
     */
    function isLocked(TransientLock storage self) internal view returns (bool) {
        return self._raw.tload() == _LOCKED;
    }
}
