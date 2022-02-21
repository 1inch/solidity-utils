// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

import "@openzeppelin/contracts/utils/Strings.sol";

contract GasChecker {
    using Strings for uint256;

    modifier checkGasCost(uint256 expectedGasCost) {
        uint256 gas = gasleft();
        _;
        gas -= gasleft();
        if (expectedGasCost > 0) {
            require (gas == expectedGasCost, string(abi.encodePacked("Gas cost differs: expected ", expectedGasCost.toString(), ", actual: ", gas.toString())));
        }
    }
}
