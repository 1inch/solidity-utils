// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IRescuable
 * @dev Interface for rescuing funds from the contract.
 */
interface IRescuable {
    /// @dev Native ETH transfer failed during rescue
    error ETHTransferFailed();

    /// @dev Rescues funds from the contract.
    /// @param token The token to rescue, use `IERC20(address(0))` for native ETH.
    /// @param amount The amount to rescue.
    function rescueFunds(IERC20 token, uint256 amount) external;
}
