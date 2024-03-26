// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title IERC20MetadataUppercase
 * @dev Interface for ERC20 token metadata with uppercase naming convention.
 */
interface IERC20MetadataUppercase {
    /**
     * @notice Gets the token name.
     * @return Token name.
     */
    function NAME() external view returns (string memory); // solhint-disable-line func-name-mixedcase

    /**
     * @notice Gets the token symbol.
     * @return Token symbol.
     */
    function SYMBOL() external view returns (string memory); // solhint-disable-line func-name-mixedcase
}
