// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@0xsequence/create3/contracts/Create3.sol";

contract Create3Mock {
    function deploy(bytes32 salt, bytes calldata code) external returns (address) {
        return Create3.create3(salt, code);
    }

    function addressOf(bytes32 salt) external view returns (address) {
        return Create3.addressOf(salt);
    }
}


