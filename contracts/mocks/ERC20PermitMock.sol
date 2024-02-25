// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "./TokenMock.sol";

/**
 * @title ERC20PermitMock
 * @dev Extends ERC20Permit and TokenMock for testing purposes, incorporating permit functionality.
 * This contract simplifies the testing of ERC20 tokens with permit capabilities by allowing easy setup of initial states.
 */
contract ERC20PermitMock is ERC20Permit, TokenMock {
    /**
     * @dev Creates an instance of `ERC20PermitMock` with specified token details and initial token distribution.
     * @param name Name of the ERC20 token.
     * @param symbol Symbol of the ERC20 token.
     * @param initialAccount Address to receive the initial token supply.
     * @param initialBalance Amount of tokens to mint to the `initialAccount`.
     */
    constructor(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialBalance
    ) payable TokenMock(name, symbol) ERC20Permit(name) {
        _mint(initialAccount, initialBalance);
    }
}
