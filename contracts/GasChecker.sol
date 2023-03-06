// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract GasChecker {
    error GasCostDiffers(uint256 expected, uint256 actual);

    modifier checkGasCost(uint256 expected) {
        uint256 gas = gasleft();
        _;
        unchecked {
            gas -= gasleft();
        }
        if (expected > 0 && gas != expected) {
            revert GasCostDiffers(expected, gas);
        }
    }
}
