// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../../libraries/TransientLock.sol";

contract TransientLockMock {
    using TransientLockLib for TransientLock;

    TransientLock private _lock;

    function lock() external {
        _lock.lock();
    }

    function unlock() external {
        _lock.unlock();
    }

    function isLocked() external view returns (bool) {
        return _lock.isLocked();
    }

    function lockAndCheck() external returns (bool) {
        _lock.lock();
        return _lock.isLocked();
    }

    function lockUnlockAndCheck() external returns (bool) {
        _lock.lock();
        _lock.unlock();
        return _lock.isLocked();
    }

    function doubleLock() external {
        _lock.lock();
        _lock.lock();
    }

    function unlockWithoutLock() external {
        _lock.unlock();
    }
}
