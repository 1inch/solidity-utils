// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title EthReceiver
 * @dev Abstract contract for rejecting direct ETH transfers from EOAs.
 * Implements a custom error and logic to reject ETH deposits from non-contract addresses.
 */
abstract contract EthReceiver {
    /// @dev Error thrown when an ETH deposit from an EOA is attempted.
    error EthDepositRejected();

    /// @dev External payable function to receive ETH, automatically rejects deposits from EOAs.
    receive() external payable {
        _receive();
    }

    /**
     * @dev Internal function containing the logic to reject ETH deposits.
     * Can be overridden by derived contracts for specific behaviors while maintaining the base rejection mechanism.
     */
    function _receive() internal virtual {
        // solhint-disable-next-line avoid-tx-origin
        if (msg.sender == tx.origin) revert EthDepositRejected();
    }
}
