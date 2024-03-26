// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title BytesStorage
 * @notice A library for operating on bytes storage slices.
 */
library BytesStorage {
    error OutOfBounds();

    /**
     * @dev A struct representing a slice of bytes storage.
     */
    struct Slice {
        uint256 slot; // The storage slot where the data begins.
        uint256 offset; // The byte offset within the slot where the data begins.
        uint256 length; // The length of the data in bytes.
    }

    /**
     * @dev Wraps a bytes storage array into a `Slice`. For a detailed explanation,
     *      refer to https://ethereum.stackexchange.com/questions/107282/storage-and-memory-layout-of-strings/155800#155800
     * @param data The bytes storage array to wrap.
     * @return A `Slice` struct that refers to the storage location and length of `data`.
     */
    function wrap(bytes storage data) internal view returns (Slice memory) {
        uint256 length;
        uint256 slot;
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            let blob := sload(data.slot)

            switch and(1, blob)
            case 0 { // Short
                slot := data.slot
                length := shr(1, and(blob, 0xFF))
            }
            default { // Long
                mstore(0, data.slot)
                slot := keccak256(0, 0x20)
                length := shr(1, blob)
            }
        }

        return Slice({
            slot: slot,
            offset: 0,
            length: length
        });
    }

    /**
     * @dev Returns a new `Slice` representing a portion of the original storage slice.
     * @param data The original `Slice` to take a portion from.
     * @param offset The offset in bytes from the start of the original `Slice`.
     * @param size The size of the new `Slice` in bytes.
     * @return A new `Slice` struct representing the specified portion of the original.
     */
    function slice(Slice memory data, uint256 offset, uint256 size) internal pure returns (Slice memory) {
        if (offset + size > data.length) revert OutOfBounds();

        uint256 newOffset = data.offset + offset;
        return Slice({
            slot: data.slot + (newOffset >> 5),
            offset: newOffset & 0x1f,
            length: size
        });
    }

    /**
     * @dev Copies a `Slice` from storage and returns it as a new bytes array.
     * @param piece The `Slice` to copy from storage.
     * @return ret The new bytes array containing the copied data.
     */
    function copy(Slice memory piece) internal view returns (bytes memory ret) {
        uint256 startSlot = piece.slot;
        uint256 offset = piece.offset;
        uint256 length = piece.length;
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            ret := mload(0x40)
            mstore(0x40, add(ret, add(0x20, length)))
            mstore(ret, length)

            let out := add(ret, 0x20)
            let endSlot := add(startSlot, div(add(add(length, offset), 0x1F), 0x20))

            mstore(out, shl(mul(8, offset), sload(startSlot)))
            out := add(out, sub(0x20, offset))

            for { let slot := add(startSlot, 1) } lt(slot, endSlot) { slot := add(slot, 1) } {
                mstore(out, sload(slot))
                out := add(out, 0x20)
            }
        }
    }
}
