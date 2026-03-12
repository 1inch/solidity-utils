// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { tuint256, taddress, tbytes32 } from "./Transient.sol";

/**
 * @title TransientUnsafe
 * @dev Library for transient storage without slot offset.
 * Uses raw storage slots directly, saving 6 gas per access on dynamic slots (mappings).
 * Safe for use with mappings where slots are already keccak256-hashed and cannot collide
 * storage slots can collide with native `transient` keyword variables because
 * transient storage has it is own space and storage slots for transient storage also starts from zero,
 * so when we use transient lib which operates storage slots indexes from storage
 * and collides if use transient lib for a varible with static storage index
 * with Solidity's `transient` keyword (which does not support mappings).
 * WARNING: Do not use for simple struct fields — use TransientLib instead to avoid
 * potential slot collisions with native `transient` keyword variables.
 */
library TransientUnsafe {
    /**
     * @dev Error thrown when increment would cause overflow.
     */
    error MathOverflow();

    /**
     * @dev Error thrown when decrement would cause underflow.
     */
    error MathUnderflow();

    // ===================== Functions for tuint256 =====================

    /**
     * @dev Loads a uint256 value from transient storage.
     * @param self The transient uint256 storage slot.
     * @return ret The value stored in transient storage.
     */
    function tload(tuint256 storage self) internal view returns (uint256 ret) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            ret := tload(self.slot)
        }
    }

    /**
     * @dev Stores a uint256 value to transient storage.
     * @param self The transient uint256 storage slot.
     * @param value The value to store.
     */
    function tstore(tuint256 storage self, uint256 value) internal {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            tstore(self.slot, value)
        }
    }

    /**
     * @dev Increments the transient uint256 value by 1 with overflow check.
     * Reverts with MathOverflow if the value would overflow.
     * @param self The transient uint256 storage slot.
     * @return incremented The new value after incrementing.
     */
    function inc(tuint256 storage self) internal returns (uint256 incremented) {
        return inc(self, TransientUnsafe.MathOverflow.selector);
    }

    /**
     * @dev Increments the transient uint256 value by 1 with custom overflow error.
     * @param self The transient uint256 storage slot.
     * @param exception The error selector to revert with on overflow.
     * @return incremented The new value after incrementing.
     */
    function inc(tuint256 storage self, bytes4 exception) internal returns (uint256 incremented) {
        incremented = unsafeInc(self);
        if (incremented == 0) {
            assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
                mstore(0, exception)
                revert(0, 4)
            }
        }
    }

    /**
     * @dev Increments the transient uint256 value by 1 without overflow check.
     * Warning: May overflow silently.
     * @param self The transient uint256 storage slot.
     * @return incremented The new value after incrementing.
     */
    function unsafeInc(tuint256 storage self) internal returns (uint256 incremented) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            incremented := add(tload(self.slot), 1)
            tstore(self.slot, incremented)
        }
    }

    /**
     * @dev Decrements the transient uint256 value by 1 with underflow check.
     * Reverts with MathUnderflow if the value would underflow.
     * @param self The transient uint256 storage slot.
     * @return decremented The new value after decrementing.
     */
    function dec(tuint256 storage self) internal returns (uint256 decremented) {
        return dec(self, TransientUnsafe.MathUnderflow.selector);
    }

    /**
     * @dev Decrements the transient uint256 value by 1 with custom underflow error.
     * @param self The transient uint256 storage slot.
     * @param exception The error selector to revert with on underflow.
     * @return decremented The new value after decrementing.
     */
    function dec(tuint256 storage self, bytes4 exception) internal returns (uint256 decremented) {
        decremented = unsafeDec(self);
        if (decremented == type(uint256).max) {
            assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
                mstore(0, exception)
                revert(0, 4)
            }
        }
    }

    /**
     * @dev Decrements the transient uint256 value by 1 without underflow check.
     * Warning: May underflow silently.
     * @param self The transient uint256 storage slot.
     * @return decremented The new value after decrementing.
     */
    function unsafeDec(tuint256 storage self) internal returns (uint256 decremented) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            decremented := sub(tload(self.slot), 1)
            tstore(self.slot, decremented)
        }
    }

    /**
     * @dev Initializes with a value if zero, then adds to the transient uint256.
     * @param self The transient uint256 storage slot.
     * @param initialValue The value to use if current value is zero.
     * @param toAdd The value to add.
     * @return result The final value after initialization and addition.
     */
    function initAndAdd(tuint256 storage self, uint256 initialValue, uint256 toAdd) internal returns (uint256 result) {
        result = tload(self);
        if (result == 0) {
            result = initialValue;
        }
        result += toAdd;
        tstore(self, result);
    }

    // ===================== Functions for taddress =====================

    /**
     * @dev Loads an address value from transient storage.
     * @param self The transient address storage slot.
     * @return ret The address stored in transient storage.
     */
    function tload(taddress storage self) internal view returns (address ret) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            ret := tload(self.slot)
        }
    }

    /**
     * @dev Stores an address value to transient storage.
     * @param self The transient address storage slot.
     * @param value The address to store.
     */
    function tstore(taddress storage self, address value) internal {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            tstore(self.slot, value)
        }
    }

    // ===================== Functions for tbytes32 =====================

    /**
     * @dev Loads a bytes32 value from transient storage.
     * @param self The transient bytes32 storage slot.
     * @return ret The bytes32 value stored in transient storage.
     */
    function tload(tbytes32 storage self) internal view returns (bytes32 ret) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            ret := tload(self.slot)
        }
    }

    /**
     * @dev Stores a bytes32 value to transient storage.
     * @param self The transient bytes32 storage slot.
     * @param value The bytes32 value to store.
     */
    function tstore(tbytes32 storage self, bytes32 value) internal {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            tstore(self.slot, value)
        }
    }
}
