// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../../libraries/TransientLockUnsafe.sol";

contract TransientLockUnsafeNestedMock {
    using TransientLockUnsafeLib for TransientLock;

    mapping(address maker => mapping(bytes32 strategyHash => TransientLock)) internal _reentrancyLocks;

    function lock(address maker, bytes32 strategyHash) external {
        _reentrancyLocks[maker][strategyHash].lock();
    }

    function unlock(address maker, bytes32 strategyHash) external {
        _reentrancyLocks[maker][strategyHash].unlock();
    }

    function isLocked(address maker, bytes32 strategyHash) external view returns (bool) {
        return _reentrancyLocks[maker][strategyHash].isLocked();
    }

}
