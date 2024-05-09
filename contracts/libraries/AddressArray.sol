// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title AddressArray
 * @notice Implements a dynamic array of addresses using a mapping for storage efficiency, with the array length stored at index 0.
 * @dev This library provides basic functionalities such as push, pop, set, and retrieval of addresses in a storage-efficient manner.
 */
library AddressArray {
    /**
     * @dev Error thrown when attempting to access an index outside the bounds of the array.
     */
    error IndexOutOfBounds();

    /**
     * @dev Error thrown when attempting to pop an element from an empty array.
     */
    error PopFromEmptyArray();

    /**
     * @dev Error thrown when the output array provided for getting the list of addresses is too small.
     */
    error OutputArrayTooSmall();

    uint256 internal constant _ZERO_ADDRESS = 0x8000000000000000000000000000000000000000000000000000000000000000; // Next tx gas optimization
    uint256 internal constant _LENGTH_MASK  = 0x0000000000000000ffffffff0000000000000000000000000000000000000000;
    uint256 internal constant _ADDRESS_MASK = 0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff;
    uint256 internal constant _ONE_LENGTH   = 0x0000000000000000000000010000000000000000000000000000000000000000;
    uint256 internal constant _LENGTH_OFFSET = 160;

    /**
     * @dev Struct containing the raw mapping used to store the addresses and the array length.
     */
    struct Data {
        uint256[1 << 32] _raw;
    }

    /**
     * @notice Returns the number of addresses stored in the array.
     * @param self The instance of the Data struct.
     * @return The number of addresses.
     */
    function length(Data storage self) internal view returns (uint256) {
        return (self._raw[0] & _LENGTH_MASK) >> _LENGTH_OFFSET;
    }

    /**
     * @notice Retrieves the address at a specified index in the array. Reverts if the index is out of bounds.
     * @param self The instance of the Data struct.
     * @param i The index to retrieve the address from.
     * @return The address stored at the specified index.
     */
    function at(Data storage self, uint256 i) internal view returns (address) {
        if (length(self) <= i) revert IndexOutOfBounds();
        return address(uint160(self._raw[i] & _ADDRESS_MASK));
    }

    /**
     * @notice Retrieves the address at a specified index in the array without bounds checking.
     * @param self The instance of the Data struct.
     * @param i The index to retrieve the address from.
     * @return The address stored at the specified index.
     */
    function unsafeAt(Data storage self, uint256 i) internal view returns (address) {
        if (i >= 1 << 32) revert IndexOutOfBounds();
        return address(uint160(self._raw[i] & _ADDRESS_MASK));
    }

    /**
     * @notice Returns all addresses in the array from storage.
     * @param self The instance of the Data struct.
     * @return output Array containing all the addresses.
     */
    function get(Data storage self) internal view returns (address[] memory output) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            let lengthAndFirst := sload(self.slot)
            let len := shr(_LENGTH_OFFSET, and(lengthAndFirst, _LENGTH_MASK))
            let fst := and(lengthAndFirst, _ADDRESS_MASK)

            // Allocate array
            output := mload(0x40)
            mstore(0x40, add(output, mul(0x20, add(1, len))))
            mstore(output, len)

            if len {
                // Copy first element and then the rest in a loop
                let ptr := add(output, 0x20)
                mstore(ptr, fst)
                for { let i := 1 } lt(i, len) { i:= add(i, 1) } {
                    let item := and(sload(add(self.slot, i)), _ADDRESS_MASK)
                    mstore(add(ptr, mul(0x20, i)), item)
                }
            }
        }
    }

    /**
     * @notice Copies the addresses into the provided output array.
     * @param self The instance of the Data struct.
     * @param input The array to copy the addresses into.
     * @return output The provided output array filled with addresses.
     */
    function get(Data storage self, address[] memory input) internal view returns (address[] memory output) {
        output = input;
        bytes4 err = OutputArrayTooSmall.selector;
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            let lengthAndFirst := sload(self.slot)
            let len := shr(_LENGTH_OFFSET, and(lengthAndFirst, _LENGTH_MASK))
            let fst := and(lengthAndFirst, _ADDRESS_MASK)

            if gt(len, mload(input)) {
                mstore(0, err)
                revert(0, 4)
            }
            if len {
                // Copy first element and then the rest in a loop
                let ptr := add(output, 0x20)
                mstore(ptr, fst)
                for { let i := 1 } lt(i, len) { i:= add(i, 1) } {
                    let item := and(sload(add(self.slot, i)), _ADDRESS_MASK)
                    mstore(add(ptr, mul(0x20, i)), item)
                }
            }
        }
    }

    /**
     * @notice Adds an address to the end of the array.
     * @param self The instance of the Data struct.
     * @param account The address to add.
     * @return res The new length of the array.
     */
    function push(Data storage self, address account) internal returns (uint256 res) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            let lengthAndFirst := sload(self.slot)
            let len := shr(_LENGTH_OFFSET, and(lengthAndFirst, _LENGTH_MASK))

            switch len
            case 0 {
                sstore(self.slot, or(account, _ONE_LENGTH))
            }
            default {
                sstore(self.slot, add(lengthAndFirst, _ONE_LENGTH))
                sstore(add(self.slot, len), or(account, _ZERO_ADDRESS))
            }
            res := add(len, 1)
        }
    }

    /**
     * @notice Removes the last address from the array.
     * @param self The instance of the Data struct.
     */
    function pop(Data storage self) internal {
        bytes4 err = PopFromEmptyArray.selector;
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            let lengthAndFirst := sload(self.slot)
            let len := shr(_LENGTH_OFFSET, and(lengthAndFirst, _LENGTH_MASK))

            switch len
            case 0 {
                mstore(0, err)
                revert(0, 4)
            }
            case 1 {
                sstore(self.slot, _ZERO_ADDRESS)
            }
            default {
                sstore(self.slot, sub(lengthAndFirst, _ONE_LENGTH))
            }
        }
    }

    /**
     * @notice Array pop back operation for storage `self` that returns popped element.
     * @param self The instance of the Data struct.
     * @return res The address that was removed from the array.
     */
    function popGet(Data storage self) internal returns(address res) {
        bytes4 err = PopFromEmptyArray.selector;
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            let lengthAndFirst := sload(self.slot)
            let len := shr(_LENGTH_OFFSET, and(lengthAndFirst, _LENGTH_MASK))

            switch len
            case 0 {
                mstore(0, err)
                revert(0, 4)
            }
            case 1 {
                res := and(lengthAndFirst, _ADDRESS_MASK)
                sstore(self.slot, _ZERO_ADDRESS)
            }
            default {
                res := and(sload(add(self.slot, sub(len, 1))), _ADDRESS_MASK)
                sstore(self.slot, sub(lengthAndFirst, _ONE_LENGTH))
            }
        }
    }

    /**
     * @notice Sets the address at a specified index in the array.
     * @param self The instance of the Data struct.
     * @param index The index at which to set the address.
     * @param account The address to set at the specified index.
     */
    function set(Data storage self, uint256 index, address account) internal {
        bytes4 err = IndexOutOfBounds.selector;
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            let lengthAndFirst := sload(self.slot)
            let len := shr(_LENGTH_OFFSET, and(lengthAndFirst, _LENGTH_MASK))
            let fst := and(lengthAndFirst, _ADDRESS_MASK)

            if iszero(lt(index, len)) {
                mstore(0, err)
                revert(0, 4)
            }

            switch index
            case 0 {
                sstore(self.slot, or(xor(lengthAndFirst, fst), account))
            }
            default {
                sstore(add(self.slot, index), or(account, _ZERO_ADDRESS))
            }
        }
    }

    /**
     * @notice Erase length of the array.
     * @param self The instance of the Data struct.
     */
    function erase(Data storage self) internal {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            sstore(self.slot, _ADDRESS_MASK)
        }
    }
}
