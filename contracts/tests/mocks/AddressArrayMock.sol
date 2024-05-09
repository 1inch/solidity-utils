// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../libraries/AddressArray.sol";

contract AddressArrayMock {
    using AddressArray for AddressArray.Data;

    AddressArray.Data private _self;

    error PopFromEmptyArray();

    function length() external view returns (uint256) {
        return AddressArray.length(_self);
    }

    function at(uint256 i) external view returns (address) {
        return AddressArray.at(_self, i);
    }

    function unsafeAt(uint256 i) external view returns (address) {
        return AddressArray.unsafeAt(_self, i);
    }

    function get() external view returns (address[] memory arr) {
        return AddressArray.get(_self);
    }

    function push(address account) external returns (uint256) {
        return AddressArray.push(_self, account);
    }

    function pop() external {
        AddressArray.pop(_self);
    }

    function set(uint256 index, address account) external {
        AddressArray.set(_self, index, account);
    }
}
