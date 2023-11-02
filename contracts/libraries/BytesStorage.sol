// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library BytesStorage {
    error OutOfBounds();

    struct Slice {
        uint256 slot;
        uint256 offset;
        uint256 length;
    }

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
            case 1 { // Long
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

    function slice(Slice memory data, uint256 offset, uint256 size) internal pure returns (Slice memory) {
        if (offset + size > data.length) revert OutOfBounds();

        uint256 newOffset = data.offset + offset;
        return Slice({
            slot: data.slot + (newOffset >> 5),
            offset: newOffset & 0x1f,
            length: size
        });
    }

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


            for { let slot := startSlot } lt(slot, endSlot) { slot := add(slot, 1) } {
                let data := sload(slot)
                data := shl(mul(8, offset), data)
                mstore(out, data)
                out := add(out, 0x20)
                offset := 0
            }

            if lt(out, add(ret, add(0x20, length))) {
                // Handle leftover bytes if any in case `length mod 32` != 0
                let data := sload(endSlot)
                let mask := sub(exp(256, sub(0x20, mod(length, 0x20))), 1)
                data := and(data, not(mask))
                mstore(out, data)
            }
        }
    }
}
