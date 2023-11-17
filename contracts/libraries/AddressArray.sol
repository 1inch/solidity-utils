// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @title Library that implements address array on mapping, stores array length at 0 index.
library AddressArray {
    error IndexOutOfBounds();
    error PopFromEmptyArray();
    error OutputArrayTooSmall();

    uint256 internal constant _ZERO_ADDRESS = 0x8000000000000000000000000000000000000000000000000000000000000000; // Next tx gas optimization
    uint256 internal constant _LENGTH_MASK  = 0x0000000000000000ffffffff0000000000000000000000000000000000000000;
    uint256 internal constant _ADDRESS_MASK = 0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff;
    uint256 internal constant _ONE_LENGTH   = 0x0000000000000000000000010000000000000000000000000000000000000000;
    uint256 internal constant _LENGTH_OFFSET = 160;

    /// @dev Data struct containing raw mapping.
    struct Data {
        uint256[1 << 32] _raw;
    }

    /// @dev Length of array.
    function length(Data storage self) internal view returns (uint256 res) {
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            res := shr(_LENGTH_OFFSET, and(sload(self.offset), _LENGTH_MASK))
        }
    }

    /// @dev Returns data item from `self` storage at `i`.
    function at(Data storage self, uint256 i) internal view returns (address res) {
        if (i >= 1 << 32) revert IndexOutOfBounds();
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            res := and(sload(add(self.offset, i)), _ADDRESS_MASK)
        }
    }

    /// @dev Returns list of addresses from storage `self`.
    function get(Data storage self) internal view returns (address[] memory output) {
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            let lengthAndFirst := sload(self.offset)
            let len := shr(_LENGTH_OFFSET, and(lengthAndFirst, _LENGTH_MASK))
            let fst := and(lengthAndFirst, _ADDRESS_MASK)

            // Allocate array
            output := mload(0x40)
            mstore(0x40, add(output, mul(0x20, add(1, len))))
            mstore(output, len)

            // Copy first element and the rest in loop
            let ptr := add(output, 0x20)
            mstore(ptr, fst)
            for { let i := 1 } lt(i, len) { i:= add(i, 1) } {
                let item := sload(add(self.offset, i))
                mstore(add(ptr, mul(0x20, i)), item)
            }
        }
    }

    /// @dev Puts list of addresses from `self` storage into `output` array.
    function get(Data storage self, address[] memory input) internal view returns (address[] memory output) {
        output = input;
        bool exception;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            let lengthAndFirst := sload(self.offset)
            let len := shr(_LENGTH_OFFSET, and(lengthAndFirst, _LENGTH_MASK))
            let fst := and(lengthAndFirst, _ADDRESS_MASK)

            if gt(len, mload(input)) {
                exception := true
            }

            // Copy first element and the rest in loop
            let ptr := add(output, 0x20)
            mstore(ptr, fst)
            for { let i := 1 } lt(i, len) { i:= add(i, 1) } {
                let item := and(sload(add(self.offset, i)), _ADDRESS_MASK)
                mstore(add(ptr, mul(0x20, i)), item)
            }
        }
        if (exception) revert OutputArrayTooSmall();
    }

    /// @dev Array push back `account` operation on storage `self`.
    function push(Data storage self, address account) internal returns (uint256 res) {
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            let lengthAndFirst := sload(self.offset)
            let len := shr(_LENGTH_OFFSET, and(lengthAndFirst, _LENGTH_MASK))

            switch len
            case 0 {
                sstore(self.offset, or(or(account, _ONE_LENGTH), _ZERO_ADDRESS))
            }
            default {
                sstore(self.offset, add(lengthAndFirst, _ONE_LENGTH))
                sstore(add(self.offset, len), or(account, _ZERO_ADDRESS))
            }
            res := add(len, 1)
        }
    }

    /// @dev Array pop back operation for storage `self`.
    function pop(Data storage self) internal returns(address res) {
        bool exception;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            let lengthAndFirst := sload(self.offset)
            let len := shr(_LENGTH_OFFSET, and(lengthAndFirst, _LENGTH_MASK))

            switch len
            case 0 {
                exception := true
            }
            case 1 {
                res := and(sload(self.offset), _ADDRESS_MASK)
                sstore(self.offset, _ZERO_ADDRESS)
            }
            default {
                res := and(sload(add(self.offset, sub(len, 1))), _ADDRESS_MASK)
                sstore(self.offset, sub(lengthAndFirst, _ONE_LENGTH))
            }
        }
        if (exception) revert PopFromEmptyArray();
    }

    /// @dev Set element for storage `self` at `index` to `account`.
    function set(Data storage self, uint256 index, address account) internal {
        bool exception;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            let lengthAndFirst := sload(self.offset)
            let len := shr(_LENGTH_OFFSET, and(lengthAndFirst, _LENGTH_MASK))
            let fst := and(lengthAndFirst, _ADDRESS_MASK)

            if iszero(lt(index, len)) {
                exception := true
            }

            switch index
            case 0 {
                sstore(self.offset, or(xor(lengthAndFirst, fst), account))
            }
            default {
                sstore(add(self.offset, index), or(account, _ZERO_ADDRESS))
            }
        }
        if (exception) revert IndexOutOfBounds();
    }

    /// @dev Erase length of the array
    function erase(Data storage self) internal {
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            sstore(self.offset, _ADDRESS_MASK)
        }
    }
}
