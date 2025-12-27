// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title Calldata
 * @dev Library for efficient slicing of calldata byte arrays without memory copying.
 * Provides gas-optimized operations for extracting portions of calldata directly.
 */
library Calldata {
    /**
     * @dev Returns a slice of the calldata bytes from `begin` to `end` index.
     * Warning: Does not perform bounds checking for gas efficiency.
     * @param calls The calldata bytes to slice.
     * @param begin The starting index of the slice.
     * @param end The ending index of the slice (exclusive).
     * @return res The sliced calldata bytes.
     */
    function slice(bytes calldata calls, uint256 begin, uint256 end) internal pure returns (bytes calldata res) {
        assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
            res.offset := add(calls.offset, begin)
            res.length := sub(end, begin)
        }
    }

    /**
     * @dev Returns a slice of the calldata bytes from `begin` to `end` index with bounds checking.
     * Reverts with the provided exception selector if `end` exceeds the calldata length.
     * @param calls The calldata bytes to slice.
     * @param begin The starting index of the slice.
     * @param end The ending index of the slice (exclusive).
     * @param exception The error selector to revert with if bounds check fails.
     * @return res The sliced calldata bytes.
     */
    function slice(bytes calldata calls, uint256 begin, uint256 end, bytes4 exception) internal pure returns (bytes calldata res) {
        if (end > calls.length) {
            assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
                mstore(0, exception)
                revert(0, 4)
            }
        }
        assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
            res.offset := add(calls.offset, begin)
            res.length := sub(end, begin)
        }
    }

    /**
     * @dev Returns a slice of the calldata bytes from `begin` index to the end.
     * Warning: Does not perform bounds checking for gas efficiency.
     * @param calls The calldata bytes to slice.
     * @param begin The starting index of the slice.
     * @return res The sliced calldata bytes from begin to the end.
     */
    function slice(bytes calldata calls, uint256 begin) internal pure returns (bytes calldata res) {
        assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
            res.offset := add(calls.offset, begin)
            res.length := sub(calls.length, begin)
        }
    }

    /**
     * @dev Returns a slice of the calldata bytes from `begin` index to the end with bounds checking.
     * Reverts with the provided exception selector if `begin` exceeds the calldata length.
     * @param calls The calldata bytes to slice.
     * @param begin The starting index of the slice.
     * @param exception The error selector to revert with if bounds check fails.
     * @return res The sliced calldata bytes from begin to the end.
     */
    function slice(bytes calldata calls, uint256 begin, bytes4 exception) internal pure returns (bytes calldata res) {
        if (begin > calls.length) {
            assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
                mstore(0, exception)
                revert(0, 4)
            }
        }
        assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
            res.offset := add(calls.offset, begin)
            res.length := sub(calls.length, begin)
        }
    }
}
