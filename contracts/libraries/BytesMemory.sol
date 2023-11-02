// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library BytesMemory {
    error OutOfBounds();

    struct Slice {
        uint256 pointer;
        uint256 length;
    }

    function wrap(bytes memory data) internal pure returns (Slice memory) {
        uint256 pointer;
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            pointer := add(data, 0x20)
        }

        return Slice({
            pointer: pointer,
            length: data.length
        });
    }

    function slice(Slice memory data, uint256 offset, uint256 size) internal pure returns (Slice memory) {
        if (offset + size > data.length) revert OutOfBounds();

        return Slice({
            pointer: data.pointer + offset,
            length: size
        });
    }

    function unwrap(Slice memory piece) internal view returns (bytes memory ret) {
        uint256 pointer = piece.pointer;
        uint256 length = piece.length;
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            ret := mload(0x40)
            mstore(0x40, add(0x20, length))
            mstore(ret, length)

            pop(staticcall(gas(), 0x04, pointer, length, add(ret, 0x20), length))
        }
    }
}
