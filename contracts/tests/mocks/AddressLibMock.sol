// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../libraries/AddressLib.sol";

contract AddressLibMock {
    using AddressLib for Address;

    function get(Address a) external pure returns (address) {
        return AddressLib.get(a);
    }

    function getFlag(Address a, uint256 flag) external pure returns (bool) {
        return AddressLib.getFlag(a, flag);
    }

    function getUint32(Address a, uint256 offset) external pure returns (uint32) {
        return AddressLib.getUint32(a, offset);
    }

    function getUint64(Address a, uint256 offset) external pure returns (uint64) {
        return AddressLib.getUint64(a, offset);
    }
}
