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

    /**
     * @dev Struct containing the raw mapping used to store the addresses and the array length.
     */
    struct Data {
        mapping(uint256 => uint256) _raw;
    }

    /**
     * @notice Returns the number of addresses stored in the array.
     * @param self The instance of the Data struct.
     * @return The number of addresses.
     */
    function length(Data storage self) internal view returns (uint256) {
        return self._raw[0] >> 160;
    }

    /**
     * @notice Retrieves the address at a specified index in the array.
     * @param self The instance of the Data struct.
     * @param i The index to retrieve the address from.
     * @return The address stored at the specified index.
     */
    function at(Data storage self, uint256 i) internal view returns (address) {
        return address(uint160(self._raw[i]));
    }

    /**
     * @notice Returns all addresses in the array from storage.
     * @param self The instance of the Data struct.
     * @return arr Array containing all the addresses.
     */
    function get(Data storage self) internal view returns (address[] memory arr) {
        uint256 lengthAndFirst = self._raw[0];
        arr = new address[](lengthAndFirst >> 160);
        _get(self, arr, lengthAndFirst);
    }

    /**
     * @notice Copies the addresses into the provided output array.
     * @param self The instance of the Data struct.
     * @param output The array to copy the addresses into.
     * @return The provided output array filled with addresses.
     */
    function get(Data storage self, address[] memory output) internal view returns (address[] memory) {
        return _get(self, output, self._raw[0]);
    }

    function _get(
        Data storage self,
        address[] memory output,
        uint256 lengthAndFirst
    ) private view returns (address[] memory) {
        uint256 len = lengthAndFirst >> 160;
        if (len > output.length) revert OutputArrayTooSmall();
        if (len > 0) {
            output[0] = address(uint160(lengthAndFirst));
            unchecked {
                for (uint256 i = 1; i < len; i++) {
                    output[i] = address(uint160(self._raw[i]));
                }
            }
        }
        return output;
    }

    /**
     * @notice Adds an address to the end of the array.
     * @param self The instance of the Data struct.
     * @param account The address to add.
     * @return The new length of the array.
     */
    function push(Data storage self, address account) internal returns (uint256) {
        unchecked {
            uint256 lengthAndFirst = self._raw[0];
            uint256 len = lengthAndFirst >> 160;
            if (len == 0) {
                self._raw[0] = (1 << 160) + uint160(account);
            } else {
                self._raw[0] = lengthAndFirst + (1 << 160);
                self._raw[len] = uint160(account);
            }
            return len + 1;
        }
    }

    /**
     * @notice Removes the last address from the array.
     * @param self The instance of the Data struct.
     */
    function pop(Data storage self) internal {
        unchecked {
            uint256 lengthAndFirst = self._raw[0];
            uint256 len = lengthAndFirst >> 160;
            if (len == 0) revert PopFromEmptyArray();
            self._raw[len - 1] = 0;
            if (len > 1) {
                self._raw[0] = lengthAndFirst - (1 << 160);
            }
        }
    }

    /**
     * @notice Sets the address at a specified index in the array.
     * @param self The instance of the Data struct.
     * @param index The index at which to set the address.
     * @param account The address to set at the specified index.
     */
    function set(
        Data storage self,
        uint256 index,
        address account
    ) internal {
        uint256 len = length(self);
        if (index >= len) revert IndexOutOfBounds();

        if (index == 0) {
            self._raw[0] = (len << 160) | uint160(account);
        } else {
            self._raw[index] = uint160(account);
        }
    }
}
