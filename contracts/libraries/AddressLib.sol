// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

type Address is uint256;

library AddressLib {
    uint256 private constant _LOW_160_BIT_MASK = (1 << 160) - 1;

    function get(Address a) internal pure returns (address) {
        return address(uint160(Address.unwrap(a) & _LOW_160_BIT_MASK));
    }

    function getFlag(Address a, uint256 flag) internal pure returns (bool) {
        return (Address.unwrap(a) & flag) != 0;
    }

    function getUint32(Address a, uint256 offset) internal pure returns (uint32) {
        return uint32(Address.unwrap(a) >> offset);
    }

    function getUint64(Address a, uint256 offset) internal pure returns (uint64) {
        return uint64(Address.unwrap(a) >> offset);
    }
}
