// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { TransientLock, TransientLockLib } from "../libraries/TransientLock.sol";

/**
 * @title ReentrancyGuard
 * @dev Abstract contract providing reentrancy protection using transient storage locks (EIP-1153).
 * More gas-efficient than traditional storage-based reentrancy guards.
 *
 * Use the built-in `_lock` for simple cases:
 * ```solidity
 * function swap(...) external nonReentrant {
 *     // protected code
 * }
 *
 * function doMagic(...) external onlyNonReentrantCall {
 *     // must be called within a nonReentrant context
 * }
 * ```
 *
 * Or use custom locks for more granular control:
 * ```solidity
 * TransientLock private _myLock;
 *
 * function swap(...) external nonReentrantLock(_myLock) {
 *     // protected code
 * }
 *
 * function doMagic(...) external onlyNonReentrantCallLock(_myLock) {
 *     // must be called within a nonReentrantLock(_myLock) context
 * }
 * ```
 */
abstract contract ReentrancyGuard {
    using TransientLockLib for TransientLock;

    /**
     * @dev Error thrown when a function requiring nonReentrant context is called outside of one.
     */
    error MissingNonReentrantModifier();

    TransientLock private _lock;

    /**
     * @dev Modifier that prevents reentrancy using the built-in lock.
     * Acquires the lock before execution and releases it after.
     */
    modifier nonReentrant {
        _lock.lock();
        _;
        _lock.unlock();
    }

    /**
     * @dev Modifier that ensures the function is called within a nonReentrant context.
     * Reverts with MissingNonReentrantModifier if the built-in lock is not held.
     */
    modifier onlyNonReentrantCall {
        require(_inNonReentrantCall(), MissingNonReentrantModifier());
        _;
    }

    /**
     * @dev Modifier that prevents reentrancy using a custom lock.
     * Acquires the specified lock before execution and releases it after.
     * @param lock The custom TransientLock to use.
     */
    modifier nonReentrantLock(TransientLock storage lock) {
        lock.lock();
        _;
        lock.unlock();
    }

    /**
     * @dev Modifier that ensures the function is called within a context where the specified lock is held.
     * Reverts with MissingNonReentrantModifier if the lock is not held.
     * @param lock The custom TransientLock to check.
     */
    modifier onlyNonReentrantCallLock(TransientLock storage lock) {
        require(lock.isLocked(), MissingNonReentrantModifier());
        _;
    }

    /**
     * @dev Returns true if currently within a nonReentrant call using the built-in lock.
     * @return True if the built-in lock is currently held, false otherwise.
     */
    function _inNonReentrantCall() internal view returns (bool) {
        return _lock.isLocked();
    }
}
