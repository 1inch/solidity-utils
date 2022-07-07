// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

abstract contract OnlyWethReceiver {
    error EthDepositRejected();

    // solhint-disable-next-line var-name-mixedcase
    address private immutable _WETH;

    constructor(address weth) {
        _WETH = weth;
    }

    receive() external payable {
        // solhint-disable-next-line avoid-tx-origin
        if (msg.sender != _WETH) revert EthDepositRejected();
    }
}
