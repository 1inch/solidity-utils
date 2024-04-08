// SPDX-License-Identifier: MIT

pragma solidity ^0.8.25;

import "../mixins/SelfdestructEthSender.sol";

/**
 * @title SelfdestructEthSenderMock
 * @notice Mock contract extending SelfdestructEthSender for testing purposes, with added functionality to transfer ETH.
 */
contract SelfdestructEthSenderMock is SelfdestructEthSender {
    /// @notice Indicates that an attempt to transfer ETH has failed.
    error ETHTransferFailed();

    /// @notice Allows the contract to receive ETH.
    receive() external payable {}

    /**
     * @notice Transfers the contract's entire ETH balance to the specified address.
     * @param receiver The address to which the contract's ETH balance will be transferred.
     */
    function transferBalance(address payable receiver) external payable {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = receiver.call{value: address(this).balance}("");
        if (!success) revert ETHTransferFailed();
    }
}
