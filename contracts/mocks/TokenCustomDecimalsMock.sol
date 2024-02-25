// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title TokenCustomDecimalsMock
 * @dev Extends ERC20Permit token with custom number of decimals and only owner access to `mint` and `burn` functionality.
 */
contract TokenCustomDecimalsMock is ERC20Permit, Ownable {
    uint8 internal immutable _DECIMALS;

    /**
     * @dev Sets up the ERC20 token with a name, symbol, initial amount to mint, and custom decimals.
     * @param name Name of the token.
     * @param symbol Symbol of the token.
     * @param amount Initial amount of tokens to mint to the owner.
     * @param decimals_ Custom number of decimal places for the token.
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 amount,
        uint8 decimals_
    ) ERC20(name, symbol) ERC20Permit(name) Ownable(msg.sender) {
        _mint(msg.sender, amount);
        _DECIMALS = decimals_;
    }

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

    /**
     * @dev Returns the number of decimal places of the token.
     * @return Number of decimal places.
     */
    function decimals() public view virtual override returns (uint8) {
        return _DECIMALS;
    }
}
