// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

/// @title Library that implements address array on mapping, stores array length at 0 index.
library AddressArray {
    error IndexOutOfBounds();
    error PopFromEmptyArray();
    error OutputArrayTooSmall();

    uint256 internal constant ZERO_ADDRESS = 0x8000000000000000000000000000000000000000000000000000000000000000; // Next tx gas optimization
    uint256 internal constant LENGTH_MASK  = 0x0000000000000000ffffffff0000000000000000000000000000000000000000;
    uint256 internal constant ADDRESS_MASK = 0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff;
    uint256 internal constant ONE_LENGTH   = 0x0000000000000000000000010000000000000000000000000000000000000000;

    /// @dev Data struct containing raw mapping.
    struct Data {
        mapping(uint256 => uint256) _raw;
    }

    /// @dev Length of array.
    function length(Data storage self) internal view returns (uint256 res) {
        mapping(uint256 => uint256) storage raw = self._raw;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            mstore(0x20, raw.offset)
            mstore(0x00, 0)
            res := shr(160, and(sload(keccak256(0, 0x40)), LENGTH_MASK))
        }
    }

    /// @dev Returns data item from `self` storage at `i`.
    function at(Data storage self, uint256 i) internal view returns (address res) {
        mapping(uint256 => uint256) storage raw = self._raw;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            mstore(0x20, raw.offset)
            mstore(0x00, i)
            res := and(sload(keccak256(0, 0x40)), ADDRESS_MASK)
        }
    }

    /// @dev Returns list of addresses from storage `self`.
    function get(Data storage self) internal view returns (address[] memory output) {
        mapping(uint256 => uint256) storage raw = self._raw;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            mstore(0x20, raw.offset)
            mstore(0x00, 0)
            let lengthAndFirst := sload(keccak256(0, 0x40))
            let len := shr(160, and(lengthAndFirst, LENGTH_MASK))
            let fst := and(lengthAndFirst, ADDRESS_MASK)

            // Allocate array
            output := mload(0x40)
            mstore(0x40, add(output, mul(0x20, add(1, len))))
            mstore(output, len)

            // Copy first element and the rest in loop
            let ptr := add(output, 0x20)
            mstore(ptr, fst)
            for { let i := 1 } lt(i, len) { i:= add(i, 1) } {
                mstore(0x00, i)
                let item := sload(keccak256(0, 0x40))
                mstore(add(ptr, mul(0x20, i)), item)
            }
        }
    }

    /// @dev Puts list of addresses from `self` storage into `output` array.
    function get(Data storage self, address[] memory input) internal view returns (address[] memory output) {
        output = input;
        mapping(uint256 => uint256) storage raw = self._raw;
        bool exception;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            mstore(0x20, raw.offset)
            mstore(0x00, 0)
            let lengthAndFirst := sload(keccak256(0, 0x40))
            let len := shr(160, and(lengthAndFirst, LENGTH_MASK))
            let fst := and(lengthAndFirst, ADDRESS_MASK)

            if gt(len, mload(input)) {
                exception := true
            }

            // Copy first element and the rest in loop
            let ptr := add(output, 0x20)
            mstore(ptr, fst)
            for { let i := 1 } lt(i, len) { i:= add(i, 1) } {
                mstore(0x00, i)
                let item := and(sload(keccak256(0, 0x40)), ADDRESS_MASK)
                mstore(add(ptr, mul(0x20, i)), item)
            }
        }
        if (exception) revert OutputArrayTooSmall();
    }

    /// @dev Array push back `account` operation on storage `self`.
    function push(Data storage self, address account) internal returns (uint256 res) {
        mapping(uint256 => uint256) storage raw = self._raw;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            mstore(0x20, raw.offset)
            mstore(0x00, 0)
            let sptr := keccak256(0, 0x40)
            let lengthAndFirst := sload(sptr)
            let len := shr(160, and(lengthAndFirst, LENGTH_MASK))
            let fst := and(lengthAndFirst, ADDRESS_MASK)

            switch len
            case 0 {
                sstore(sptr, or(or(account, ONE_LENGTH), ZERO_ADDRESS))
            }
            default {
                sstore(sptr, add(lengthAndFirst, ONE_LENGTH))
                mstore(0x00, len)
                sstore(keccak256(0, 0x40), or(account, ZERO_ADDRESS))
            }
            res := add(len, 1)
        }
    }

    /// @dev Array pop back operation for storage `self`.
    function pop(Data storage self) internal {
        mapping(uint256 => uint256) storage raw = self._raw;
        bool exception;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            mstore(0x20, raw.offset)
            mstore(0x00, 0)
            let sptr := keccak256(0, 0x40)
            let lengthAndFirst := sload(sptr)
            let len := shr(160, and(lengthAndFirst, LENGTH_MASK))
            let fst := and(lengthAndFirst, ADDRESS_MASK)

            switch len
            case 0 {
                exception := true
            }
            case 1 {
                sstore(sptr, ZERO_ADDRESS)
            }
            default {
                sstore(sptr, sub(lengthAndFirst, ONE_LENGTH))
            }
        }
        if (exception) revert PopFromEmptyArray();
    }

    /// @dev Set element for storage `self` at `index` to `account`.
    function set(Data storage self, uint256 index, address account) internal {
        mapping(uint256 => uint256) storage raw = self._raw;
        bool exception;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            mstore(0x20, raw.offset)
            mstore(0x00, 0)
            let sptr := keccak256(0, 0x40)
            let lengthAndFirst := sload(sptr)
            let len := shr(160, and(lengthAndFirst, LENGTH_MASK))
            let fst := and(lengthAndFirst, ADDRESS_MASK)

            if iszero(lt(index, len)) {
                exception := true
            }

            switch index
            case 0 {
                sstore(sptr, or(xor(lengthAndFirst, fst), account))
            }
            default {
                mstore(0x00, index)
                sstore(keccak256(0, 0x40), or(account, ZERO_ADDRESS))
            }
        }
        if (exception) revert IndexOutOfBounds();
    }
}
