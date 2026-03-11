// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { UniERC20 } from "../libraries/UniERC20.sol";
import { IRescuable } from "../interfaces/IRescuable.sol";

/**
 * @title Rescuable
 * @dev Abstract contract for rescuing funds from the contract.
 * Only the owner can rescue funds. Only native ETH and ERC20 tokens are supported.
 * The token is transferred to the owner's address.
 */
abstract contract Rescuable is Ownable, IRescuable {
    using UniERC20 for IERC20;

    /**
     * @dev Sets the owner of the contract.
     * @param owner Address of the owner.
     */
    constructor(address owner) Ownable(owner) {}

    /// @dev Rescues funds from the contract.
    /// @param token The token to rescue, use `IERC20(address(0))` for native ETH.
    /// @param amount The amount to rescue.
    function rescueFunds(IERC20 token,  uint256 amount) external virtual onlyOwner {
        token.uniTransfer(payable(msg.sender), amount);
    }
}
