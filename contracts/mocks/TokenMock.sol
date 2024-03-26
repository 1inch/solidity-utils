// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TokenMock
 * @dev Simple ERC20 token mock for testing purposes, with minting and burning capabilities restricted to the owner.
 */
contract TokenMock is ERC20, Ownable {
    /**
     * @dev Initializes the contract with token name and symbol, setting the deployer as the owner.
     * @param name Name of the ERC20 token.
     * @param symbol Symbol of the ERC20 token.
     */
    // solhint-disable-next-line no-empty-blocks
    constructor(string memory name, string memory symbol) ERC20(name, symbol) Ownable(msg.sender) {}

    /**
     * @notice Mints tokens to a specified account, callable only by the owner.
     * @param account The address to mint tokens to.
     * @param amount The amount of tokens to mint.
     */
    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    /**
     * @notice Burns tokens from a specified account, callable only by the owner.
     * @param account The address to burn tokens from.
     * @param amount The amount of tokens to burn.
     */
    function burn(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }
}
