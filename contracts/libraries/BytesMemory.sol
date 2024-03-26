// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title BytesMemory
 * @notice A library for operating on bytes memory slices without copying.
 */
library BytesMemory {
    error OutOfBounds();

    /**
     * @dev A struct representing a slice of bytes.
     * This points directly to memory without copying the slice.
     */
    struct Slice {
        uint256 pointer; // The pointer to the location of the slice in memory.
        uint256 length; // The length of the slice in bytes.
    }

    /**
     * @dev Creates a `Slice` from a bytes array.
     * @param data The bytes array to create a slice from.
     * @return ret A `Slice` struct representing the entire bytes array.
     */
    function wrap(bytes memory data) internal pure returns (Slice memory ret) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            mstore(ret, add(data, 0x20))
            mstore(add(ret, 0x20), mload(data))
        }
    }

    /**
     * @dev Returns a new `Slice` representing a portion of the original.
     * @param data The original `Slice` to take a portion from.
     * @param offset The offset in bytes from the start of the original `Slice`.
     * @param size The size of the new `Slice` in bytes.
     * @return ret A new `Slice` struct representing the specified portion of the original.
     */
    function slice(Slice memory data, uint256 offset, uint256 size) internal pure returns (Slice memory ret) {
        if (offset + size > data.length) revert OutOfBounds();

        unchecked {
            ret.pointer = data.pointer + offset;
            ret.length = size;
        }
    }

    /**
     * @dev Converts a `Slice` back into a bytes array. The bytes array is returned without copying the data.
     * @param piece The `Slice` to convert back to a bytes array.
     * @return ret The bytes array represented by the `Slice`.
     */
    function unwrap(Slice memory piece) internal view returns (bytes memory ret) {
        uint256 pointer = piece.pointer;
        uint256 length = piece.length;
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            ret := mload(0x40)
            mstore(0x40, add(ret, add(0x20, length)))
            mstore(ret, length)

            switch gt(length, 32)
            case 0 {
                mstore(add(ret, 0x20), mload(pointer))
            }
            default {
                pop(staticcall(gas(), 0x04, pointer, length, add(ret, 0x20), length))
            }
        }
    }
}
