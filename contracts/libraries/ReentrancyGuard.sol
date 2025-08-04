// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { TransientLock, TransientLockLib } from "./TransientLock.sol";

/// @dev Base contract with reentrancy guard functionality using transient storage locks.
///
/// Use private _lock defined in this contract:
/// ```solidity
/// function swap(...) external nonReentrant {
/// function doMagic(...) external onlyNonReentrantCall {
/// ```
///
/// Or use your own locks for more granular control:
/// ```solidity
/// TransientLock private _myLock;
/// function swap(...) external nonReentrantLock(_myLock) {
/// function doMagic(...) external onlyNonReentrantCallLock(_myLock) {
/// ```
///
abstract contract ReentrancyGuard {
    using TransientLockLib for TransientLock;

    error MissingNonReentrantModifier();

    TransientLock private _lock;

    modifier nonReentrant {
        _lock.lock();
        _;
        _lock.unlock();
    }

    modifier onlyNonReentrantCall {
        if (!_inNonReentrantCall()) revert MissingNonReentrantModifier();
        _;
    }

    modifier nonReentrantLock(TransientLock storage lock) {
        lock.lock();
        _;
        lock.unlock();
    }

    modifier onlyNonReentrantCallLock(TransientLock storage lock) {
        if (!lock.isLocked()) revert MissingNonReentrantModifier();
        _;
    }

    function _inNonReentrantCall() internal view returns (bool) {
        return _lock.isLocked();
    }
}
