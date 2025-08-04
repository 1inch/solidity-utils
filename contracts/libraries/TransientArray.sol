// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { TransientLib, tuint256, taddress, tbytes32 } from "./Transient.sol";

/// @dev Library for managing transient dynamic arrays (TSTORE, TLOAD) of different types (uint256, address, bytes32).
/// ```solidity
/// contract MagicProtocol {
///     using TransientArray for TransientArray.Uint256;
///
///     TransientArray.Uint256 private myArray;
///
///     function cook(uint256 value) external {
///         myArray.push(value);
///         require(myArray._length() == 1, "Array should not be empty after push");
///         require(myArray.at(0) == value, "Value at index 0 does not match pushed value");
///
///         uint256 poppedValue = myArray.pop();
///         require(poppedValue == value, "Popped value does not match pushed value");
///         require(myArray._length() == 0, "Array should be empty after pop");
///     }
/// }
/// ```
library TransientArray {
    using TransientLib for tuint256;
    using TransientLib for taddress;
    using TransientLib for tbytes32;

    error TransientArray_IndexOutOfBounds();
    error TransientArray_EmptyArrayPop();

    struct Uint256 {
        tuint256 _length;
        mapping(uint256 => tuint256) _items;
    }

    struct Address {
        tuint256 _length;
        mapping(uint256 => taddress) _items;
    }

    struct Bytes32 {
        tuint256 _length;
        mapping(uint256 => tbytes32) _items;
    }

    // Functions for Uint256

    function length(Uint256 storage self) internal view returns (uint256) {
        return self._length.tload();
    }

    function at(Uint256 storage self, uint256 index) internal view returns (uint256) {
        if (index >= self._length.tload()) revert TransientArray_IndexOutOfBounds();
        return self._items[index].tload();
    }

    function unsafeAt(Uint256 storage self, uint256 index) internal view returns (uint256) {
        return self._items[index].tload();
    }

    function push(Uint256 storage self, uint256 value) internal {
        uint256 nextElementIndex = self._length.tload();
        self._items[nextElementIndex].tstore(value);
        unchecked {
            self._length.tstore(nextElementIndex + 1);
        }
    }

    function pop(Uint256 storage self) internal returns (uint256 ret) {
        uint256 currentLength = self._length.tload();
        if (currentLength == 0) revert TransientArray_EmptyArrayPop();
        uint256 newLength;
        unchecked {
            newLength = currentLength - 1;
        }
        ret = self._items[newLength].tload();
        delete self._items[newLength];
        self._length.tstore(newLength);
    }

    // Functions for Address

    function length(Address storage self) internal view returns (uint256) {
        return self._length.tload();
    }

    function at(Address storage self, uint256 index) internal view returns (address) {
        if (index >= self._length.tload()) revert TransientArray_IndexOutOfBounds();
        return self._items[index].tload();
    }

    function unsafeAt(Address storage self, uint256 index) internal view returns (address) {
        return self._items[index].tload();
    }

    function push(Address storage self, address value) internal {
        uint256 nextElementIndex = self._length.tload();
        self._items[nextElementIndex].tstore(value);
        unchecked {
            self._length.tstore(nextElementIndex + 1);
        }
    }

    function pop(Address storage self) internal returns (address ret) {
        uint256 currentLength = self._length.tload();
        if (currentLength == 0) revert TransientArray_EmptyArrayPop();
        uint256 newLength;
        unchecked {
            newLength = currentLength - 1;
        }
        ret = self._items[newLength].tload();
        delete self._items[newLength];
        self._length.tstore(newLength);
    }

    // Functions for Bytes32

    function length(Bytes32 storage self) internal view returns (uint256) {
        return self._length.tload();
    }

    function at(Bytes32 storage self, uint256 index) internal view returns (bytes32) {
        if (index >= self._length.tload()) revert TransientArray_IndexOutOfBounds();
        return self._items[index].tload();
    }

    function unsafeAt(Bytes32 storage self, uint256 index) internal view returns (bytes32) {
        return self._items[index].tload();
    }

    function push(Bytes32 storage self, bytes32 value) internal {
        uint256 nextElementIndex = self._length.tload();
        self._items[nextElementIndex].tstore(value);
        unchecked {
            self._length.tstore(nextElementIndex + 1);
        }
    }

    function pop(Bytes32 storage self) internal returns (bytes32 ret) {
        uint256 currentLength = self._length.tload();
        if (currentLength == 0) revert TransientArray_EmptyArrayPop();
        uint256 newLength;
        unchecked {
            newLength = currentLength - 1;
        }
        ret = self._items[newLength].tload();
        delete self._items[newLength];
        self._length.tstore(newLength);
    }
}
