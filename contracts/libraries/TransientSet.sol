// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24; // tload/tstore are available since 0.8.24

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

import { TransientLib, tuint256, taddress, tbytes32 } from "./Transient.sol";
import { TransientArray } from "./TransientArray.sol";

/// @dev Library for managing transient dynamic arrays (TSTORE, TLOAD) of different types (uint256, address, bytes32).
/// ```solidity
/// contract MagicProtocol {
///     using TransientSet for TransientSet.Uint256;
///
///     TransientSet.Uint256 private mySet;
///
///     function cook(uint256 value) external {
///         mySet.add(value);
///         require(mySet.length() == 1, "Set should not be empty after add");
///         require(mySet.contains(value), "Set should contain the added value");
///
///         uint256 poppedValue = mySet.pop();
///         require(poppedValue == value, "Popped value does not match pushed value");
///         require(mySet.length() == 0, "Set should be empty after pop");
///     }
/// }
/// ```
library TransientSet {
    using Math for uint256;
    using TransientLib for tuint256;
    using TransientLib for taddress;
    using TransientLib for tbytes32;
    using TransientArray for TransientArray.Uint256;
    using TransientArray for TransientArray.Address;
    using TransientArray for TransientArray.Bytes32;

    error TransientSet_IndexOutOfBounds();
    error TransientSet_EmptySetPop();
    error TransientSet_InsertExistingElement();

    // Functions for Uint256

    struct Uint256 {
        TransientArray.Uint256 _items;
        mapping(uint256 => tuint256) _lookup;
    }

    function length(Uint256 storage set) internal view returns (uint256) {
        return set._items.length();
    }

    function at(Uint256 storage set, uint256 index) internal view returns (uint256) {
        return set._items.at(index);
    }

    function unsafeAt(Uint256 storage set, uint256 index) internal view returns (uint256) {
        return set._items.unsafeAt(index);
    }

    function contains(Uint256 storage set, uint256 item) internal view returns (bool) {
        return set._lookup[item].tload() != 0;
    }

    function get(Uint256 storage set) internal view returns (uint256[] memory) {
        return set._items.get();
    }

    function add(Uint256 storage set, uint256 item) internal returns (bool) {
        uint256 index = set._lookup[item].tload();
        if (index != 0) {
            return false;
        }
        set._lookup[item].tstore(set._items.push(item));
        return true;
    }

    function remove(Uint256 storage set, uint256 item) internal returns (bool) {
        uint256 index = set._lookup[item].tload();
        if (index == 0) {
            return false;
        }

        set._lookup[item].tstore(0);
        uint256 lastItem = set._items.pop();
        if (lastItem != item) {
            unchecked {
                set._items.set(index - 1, lastItem);
                set._lookup[lastItem].tstore(index);
            }
        }
        return true;
    }

    // Functions for Address

    struct Address {
        TransientArray.Address _items;
        mapping(address => tuint256) _lookup;
    }

    function length(Address storage set) internal view returns (uint256) {
        return set._items.length();
    }

    function at(Address storage set, uint256 index) internal view returns (address) {
        return set._items.at(index);
    }

    function unsafeAt(Address storage set, uint256 index) internal view returns (address) {
        return set._items.unsafeAt(index);
    }

    function contains(Address storage set, address item) internal view returns (bool) {
        return set._lookup[item].tload() != 0;
    }

    function get(Address storage set) internal view returns (address[] memory) {
        return set._items.get();
    }

    function add(Address storage set, address item) internal returns (bool) {
        uint256 index = set._lookup[item].tload();
        if (index != 0) {
            return false;
        }
        set._lookup[item].tstore(set._items.push(item));
        return true;
    }

    function remove(Address storage set, address item) internal returns (bool) {
        uint256 index = set._lookup[item].tload();
        if (index == 0) {
            return false;
        }

        set._lookup[item].tstore(0);
        address lastItem = set._items.pop();
        if (lastItem != item) {
            unchecked {
                set._items.set(index - 1, lastItem);
                set._lookup[lastItem].tstore(index);
            }
        }
        return true;
    }

    // Functions for Bytes32

    struct Bytes32 {
        TransientArray.Bytes32 _items;
        mapping(bytes32 => tuint256) _lookup; // stored as index, similar to +1 but unchecked math
    }

    function length(Bytes32 storage set) internal view returns (uint256) {
        return set._items.length();
    }

    function at(Bytes32 storage set, uint256 index) internal view returns (bytes32) {
        return set._items.at(index);
    }

    function unsafeAt(Bytes32 storage set, uint256 index) internal view returns (bytes32) {
        return set._items.unsafeAt(index);
    }

    function contains(Bytes32 storage set, bytes32 item) internal view returns (bool) {
        return set._lookup[item].tload() != 0;
    }

    function get(Bytes32 storage set) internal view returns (bytes32[] memory) {
        return set._items.get();
    }

    function add(Bytes32 storage set, bytes32 item) internal returns (bool) {
        uint256 index = set._lookup[item].tload();
        if (index != 0) {
            return false;
        }
        set._lookup[item].tstore(set._items.push(item));
        return true;
    }

    function remove(Bytes32 storage set, bytes32 item) internal returns (bool) {
        uint256 index = set._lookup[item].tload();
        if (index == 0) {
            return false;
        }

        set._lookup[item].tstore(0);
        bytes32 lastItem = set._items.pop();
        if (lastItem != item) {
            unchecked {
                set._items.set(index - 1, lastItem);
                set._lookup[lastItem].tstore(index);
            }
        }
        return true;
    }
}
