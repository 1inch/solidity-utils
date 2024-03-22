// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AddressArray.sol";

/** @title Library that is using AddressArray library for AddressArray.Data
 * and allows Set operations on address storage data:
 * 1. add
 * 2. remove
 * 3. contains
 */
library AddressSet {
    using AddressArray for AddressArray.Data;

    uint256 internal constant _NULL_INDEX = type(uint256).max;

    /// @dev Data struct from AddressArray.Data items and lookup mapping address => index in data array.
    struct Data {
        AddressArray.Data items;
        mapping(address => uint256) lookup;
    }

    /// @dev Length of data storage.
    function length(Data storage s) internal view returns (uint256) {
        return s.items.length();
    }

    /// @dev Returns data item from `s` storage at `index`.
    function at(Data storage s, uint256 index) internal view returns (address) {
        return s.items.at(index);
    }

    /// @dev Returns true if storage `s` has `item`.
    function contains(Data storage s, address item) internal view returns (bool) {
        uint256 index = s.lookup[item];
        return index != 0 && index != _NULL_INDEX;
    }

    /// @dev Returns list of addresses from storage `s`.
    function get(Data storage s) internal view returns (address[] memory) {
        return s.items.get();
    }

    /// @dev Puts list of addresses from `s` storage into `output` array.
    function get(Data storage s, address[] memory input) internal view returns (address[] memory) {
        return s.items.get(input);
    }

    /// @dev Adds `item` into storage `s` and returns true if successful.
    function add(Data storage s, address item) internal returns (bool) {
        uint256 index = s.lookup[item];
        if (index != 0 && index != _NULL_INDEX) {
            return false;
        }
        s.lookup[item] = s.items.push(item);
        return true;
    }

    /// @dev Removes `item` from storage `s` and returns true if successful.
    function remove(Data storage s, address item) internal returns (bool) {
        uint256 index = s.lookup[item];
        s.lookup[item] = _NULL_INDEX;
        if (index == 0 || index == _NULL_INDEX) {
            return false;
        }

        address lastItem = s.items.popGet();
        if (lastItem != item) {
            unchecked {
                s.items.set(index - 1, lastItem);
                s.lookup[lastItem] = index;
            }
        }
        return true;
    }

    /// @dev Erases set from storage `s` and returns all removed items
    function erase(Data storage s) internal returns(address[] memory items) {
        items = s.items.get();
        uint256 len = items.length;
        if (len > 0) {
            s.items.erase();
            unchecked {
                for (uint256 i = 0; i < len; i++) {
                    s.lookup[items[i]] = _NULL_INDEX;
                }
            }
        }
    }
}
