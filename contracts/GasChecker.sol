// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;
pragma abicoder v1;

import "hardhat/console.sol";

contract GasChecker {
    modifier checkGasCost(uint256 expectedGasCost) {
        uint256 gas = gasleft();
        _;
        gas -= gasleft();
        console.log(gas);
        require (gas == expectedGasCost, "Gas cost differs");
    }
}
