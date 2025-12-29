// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title CalldataPtr
 * @dev User-defined value type representing a pointer to calldata with offset and length packed into a single uint256.
 * The upper 128 bits store the offset, and the lower 128 bits store the length.
 */
type CalldataPtr is uint256;

/**
 * @title CalldataPtrLib
 * @dev Library for working with CalldataPtr type, providing conversion functions
 * between calldata bytes and the packed pointer representation.
 */
library CalldataPtrLib {
    using CalldataPtrLib for CalldataPtr;

    /**
     * @dev Creates a CalldataPtr from calldata bytes by packing offset and length.
     * @param data The calldata bytes to create a pointer from.
     * @return ptr The packed CalldataPtr containing offset in upper 128 bits and length in lower 128 bits.
     */
    function from(bytes calldata data) internal pure returns (CalldataPtr ptr) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            ptr := or(shl(128, data.offset), data.length)
        }
    }

    /**
     * @dev Converts a CalldataPtr back to calldata bytes by unpacking offset and length.
     * @param ptr The CalldataPtr to convert.
     * @return data The calldata bytes referenced by the pointer.
     */
    function toBytes(CalldataPtr ptr) internal pure returns (bytes calldata data) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            data.offset := shr(128, ptr)
            data.length := and(ptr, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
        }
    }
}
