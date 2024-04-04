// SPDX-License-Identifier: MIT

pragma solidity ^0.8.25;

/**
 * @title SelfdestructEthSender
 * @notice A one-time-use contract for cost-effective ETH transfers using the `selfdestruct` mechanism.
 * @dev Upon construction, this contract verifies EVM compatibility with the Cancun upgrade, specifically
 * testing for support of transient storage via `tload`. It is intended for single-use, allowing for ETH to
 * be sent more cheaply by self-destructing and sending its balance to a designated address.
 */
abstract contract SelfdestructEthSender {
    /**
     * @dev Initializes the contract, verifying compatibility with the Cancun EVM upgrade through transient storage support check.
     */
    constructor() {
        // tload is done to verify that the EVM is cancun-compatible
        // solhint-disable-next-line no-inline-assembly
        assembly ("memory-safe") {
            pop(tload(0))
        }
    }

    /**
     * @notice Self-destruct contract, transferring the entire ETH balance of the contract to the specified address.
     * @param receiver The recipient address of the contract's ETH balance.
     */
    function stopAndTransferBalance(address payable receiver) external {
        selfdestruct(receiver);
    }
}
