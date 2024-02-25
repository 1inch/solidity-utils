// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AddressArray.sol";

/**
 * @title AddressSet
 * @notice Library for managing sets of addresses, allowing operations such as add, remove, and contains.
 * Utilizes the AddressArray library for underlying data storage.
 */
library AddressSet {
    using AddressArray for AddressArray.Data;

    /**
     * @dev Data struct from AddressArray.Data items
     * and lookup mapping address => index in data array.
     */
    struct Data {
        AddressArray.Data items;
        mapping(address => uint256) lookup;
    }

    /**
     * @notice Determines the number of addresses in the set.
     * @param s The set of addresses.
     * @return The number of addresses in the set.
     */
    function length(Data storage s) internal view returns (uint256) {
        return s.items.length();
    }

    /**
     * @notice Retrieves the address at a specified index in the set.
     * @param s The set of addresses.
     * @param index The index of the address to retrieve.
     * @return The address at the specified index.
     */
    function at(Data storage s, uint256 index) internal view returns (address) {
        return s.items.at(index);
    }

    /**
     * @notice Checks if the set contains the specified address.
     * @param s The set of addresses.
     * @param item The address to check for.
     * @return True if the set contains the address, false otherwise.
     */
    function contains(Data storage s, address item) internal view returns (bool) {
        return s.lookup[item] != 0;
    }

    /**
     * @notice Adds an address to the set if it is not already present.
     * @param s The set of addresses.
     * @param item The address to add.
     * @return True if the address was added to the set, false if it was already present.
     */
    function add(Data storage s, address item) internal returns (bool) {
        if (s.lookup[item] > 0) {
            return false;
        }
        s.lookup[item] = s.items.push(item);
        return true;
    }

    /**
     * @notice Removes an address from the set if it exists.
     * @param s The set of addresses.
     * @param item The address to remove.
     * @return True if the address was removed from the set, false if it was not found.
     */
    function remove(Data storage s, address item) internal returns (bool) {
        uint256 index = s.lookup[item];
        if (index == 0) {
            return false;
        }
        if (index < s.items.length()) {
            unchecked {
                address lastItem = s.items.at(s.items.length() - 1);
                s.items.set(index - 1, lastItem);
                s.lookup[lastItem] = index;
            }
        }
        s.items.pop();
        delete s.lookup[item];
        return true;
    }
}
