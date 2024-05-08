// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../libraries/AddressSet.sol";

contract AddressSetMock {
    using AddressSet for AddressSet.Data;

    AddressSet.Data private _self;

    function length() external view returns (uint256) {
        return AddressSet.length(_self);
    }

    function at(uint256 index) external view returns (address) {
        return AddressSet.at(_self, index);
    }

    function unsafeAt(uint256 index) external view returns (address) {
        return AddressSet.unsafeAt(_self, index);
    }

    function contains(address item) external view returns (bool) {
        return AddressSet.contains(_self, item);
    }

    function get() external view returns (address[] memory) {
        return AddressSet.get(_self);
    }

    function add(address item) external returns (bool) {
        return AddressSet.add(_self, item);
    }

    function remove(address item) external returns (bool) {
        return AddressSet.remove(_self, item);
    }
}
