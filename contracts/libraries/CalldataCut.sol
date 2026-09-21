// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title CalldataCut
 * @dev Library for efficient slicing of calldata byte arrays without memory copying.
 * Provides gas-optimized operations for extracting portions of calldata directly.
 */
library CalldataCut {
    /**
     * @dev Returns a slice of the calldata bytes from `begin` to `end` index.
     * Warning: Does not perform bounds checking for gas efficiency.
     * @param data The calldata bytes to slice.
     * @param begin The starting index of the slice.
     * @param end The ending index of the slice (exclusive).
     * @return res The sliced calldata bytes.
     */
    function slice(bytes calldata data, uint256 begin, uint256 end) internal pure returns (bytes calldata res) {
        assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
            res.offset := add(data.offset, begin)
            res.length := sub(end, begin)
        }
    }

    /**
     * @dev Returns a slice of the calldata bytes from `begin` to `end` index with bounds checking.
     * Reverts with the provided exception selector if `end` exceeds the calldata length.
     * Warning: Does not check `begin <= end` for gas efficiency.
     * @param data The calldata bytes to slice.
     * @param begin The starting index of the slice.
     * @param end The ending index of the slice (exclusive).
     * @param exception The error selector to revert with if bounds check fails.
     * @return res The sliced calldata bytes.
     */
    function slice(bytes calldata data, uint256 begin, uint256 end, bytes4 exception) internal pure returns (bytes calldata res) {
        if (end > data.length) {
            assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
                mstore(0, exception)
                revert(0, 4)
            }
        }
        assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
            res.offset := add(data.offset, begin)
            res.length := sub(end, begin)
        }
    }

    /**
     * @dev Returns a slice of the calldata bytes from `begin` index to the end.
     * Warning: Does not perform bounds checking for gas efficiency.
     * @param data The calldata bytes to slice.
     * @param begin The starting index of the slice.
     * @return res The sliced calldata bytes from begin to the end.
     */
    function slice(bytes calldata data, uint256 begin) internal pure returns (bytes calldata res) {
        assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
            res.offset := add(data.offset, begin)
            res.length := sub(data.length, begin)
        }
    }

    /**
     * @dev Returns a slice of the calldata bytes from `begin` index to the end with bounds checking.
     * Reverts with the provided exception selector if `begin` exceeds the calldata length.
     * @param data The calldata bytes to slice.
     * @param begin The starting index of the slice.
     * @param exception The error selector to revert with if bounds check fails.
     * @return res The sliced calldata bytes from begin to the end.
     */
    function slice(bytes calldata data, uint256 begin, bytes4 exception) internal pure returns (bytes calldata res) {
        if (begin > data.length) {
            assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
                mstore(0, exception)
                revert(0, 4)
            }
        }
        assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
            res.offset := add(data.offset, begin)
            res.length := sub(data.length, begin)
        }
    }

    /**
     * @dev Returns a prefix of the calldata bytes with the given `length`.
     * Warning: Does not perform bounds checking for gas efficiency.
     * @param data The calldata bytes to trim.
     * @param length The length of the resulting calldata bytes.
     * @return res The trimmed calldata bytes from `data.offset` with length `length`.
     */
    function trim(bytes calldata data, uint256 length) internal pure returns (bytes calldata res) {
        assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
            res.offset := data.offset
            res.length := length
        }
    }

    /**
     * @dev Returns a prefix of the calldata bytes with the given `length` with bounds checking.
     * Reverts with the provided exception selector if `length` exceeds the calldata length.
     * @param data The calldata bytes to trim.
     * @param length The length of the resulting calldata bytes.
     * @param exception The error selector to revert with if bounds check fails.
     * @return res The trimmed calldata bytes from `data.offset` with length `length`.
     */
    function trim(bytes calldata data, uint256 length, bytes4 exception) internal pure returns (bytes calldata res) {
        if (length > data.length) {
            assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
                mstore(0, exception)
                revert(0, 4)
            }
        }
        assembly ("memory-safe") {  // solhint-disable-line no-inline-assembly
            res.offset := data.offset
            res.length := length
        }
    }
}
