// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "../../contracts/libraries/AddressSet.sol";


contract AddressSetMock {
    using AddressSet for AddressSet.Data;

    AddressSet.Data private _self;
    
    function length() external view returns(uint) {
        return AddressSet.length(_self);
    }

    function at(uint index) external view returns(address) {
        return AddressSet.at(_self, index);
    }

    function contains(address item) external view returns(bool) {
        return AddressSet.contains(_self, item);
    }

    function add(address item) external returns(bool) {
        return AddressSet.add(_self, item);
    }

    function remove(address item) external returns(bool) {
        return AddressSet.remove(_self, item);
    }
}
