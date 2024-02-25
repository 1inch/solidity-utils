// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./EthReceiver.sol";

/**
 * @title OnlyWethReceiver
 * @dev Abstract contract extending EthReceiver to accept only ETH deposits from a specified WETH contract.
 * This contract ensures that only wrapped ETH (WETH) can be deposited, rejecting all other direct ETH transfers.
 */
abstract contract OnlyWethReceiver is EthReceiver {
    /// @notice Address of the WETH contract allowed to deposit ETH.
    address private immutable _WETH; // solhint-disable-line var-name-mixedcase

    /**
     * @dev Sets the WETH contract address during construction.
     * @param weth Address of the WETH contract.
     */
    constructor(address weth) {
        _WETH = address(weth);
    }

    /**
     * @dev Overrides _receive to restrict ETH transfers solely to the WETH contract.
     * Reverts with EthDepositRejected if ETH is sent from any other address.
     */
    function _receive() internal virtual override {
        if (msg.sender != _WETH) revert EthDepositRejected();
    }
}
