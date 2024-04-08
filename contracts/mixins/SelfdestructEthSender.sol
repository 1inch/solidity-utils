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
        // solhint-disable-next-line no-inline-assembly
        assembly ("memory-safe") {
            pop(tload(0))
        }
    }

    /**
     * @notice Makes the selfdestruct call, transferring the entire ETH balance of the contract to the specified address.
     * Due to EIP-6780 chnges selfdestruct will destroy the contract only if it was created in the same transaction.
     * In other cases it will stop the execution and transfer all the ETH balance saving about 1700 gas comparing to trivial transfer.
     * @param receiver The recipient address of the contract's ETH balance.
     */
    function stopAndTransferBalance(address payable receiver) external {
        selfdestruct(receiver);
    }
}
