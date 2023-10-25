// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library BytesStorage {
    error OutOfBounds();

    struct Slice {
        uint256 slot;
        uint256 offset;
        uint256 length;
    }

    function slice(bytes storage data) internal view returns(Slice memory) {
        return slice(data, 0, data.length);
    }

    function slice(bytes storage data, uint256 offset, uint256 size) internal view returns(Slice memory) {
        uint256 length;
        uint256 slot;
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            let blob := sload(data.slot)
            length := shr(1, blob)

            switch and(1, blob)
            case 0 { // Short
                slot := add(data.slot, div(offset, 0x20))
            }
            case 1 { // Long
                mstore(0x00, data.slot)
                slot := add(keccak256(0x00, 0x20), div(offset, 0x20))
            }
        }
        if (offset + size > length) revert OutOfBounds();

        return Slice({
            slot: slot,
            offset: offset & 0x1f,
            length: size
        });
    }

    function slice(Slice memory data, uint256 offset, uint256 size) internal pure returns(Slice memory) {
        if (offset + size > data.length) revert OutOfBounds();

        uint256 newOffset = data.offset + offset;
        return Slice({
            slot: data.slot + (newOffset >> 5),
            offset: newOffset & 0x1f,
            length: size
        });
    }

    function copy(Slice memory piece) internal view returns(bytes memory ret) {
        uint256 startSlot = piece.slot;
        uint256 offset = piece.offset;
        uint256 length = piece.length;
        assembly {
            ret := mload(0x40)
            mstore(0x40, add(0x20, length))
            mstore(ret, length)
            let out := add(ret, 0x20)
            let endSlot := add(startSlot, div(length, 0x20))

            mstore(out, shl(sload(startSlot), mul(8, offset)))
            out := add(out, sub(0x20, offset))
            for { let slot := add(startSlot, 1) } lt(slot, endSlot) { slot := add(slot, 1) } {
                mstore(out, sload(slot))
                out := add(out, 0x20)
            }
        }
    }
}
