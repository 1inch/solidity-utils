// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

import "./EthReceiver.sol";

abstract contract OnlyWethReceiver is EthReceiver {
    address private immutable _WETH;  // solhint-disable-line var-name-mixedcase

    constructor(address weth) {
        _WETH = address(weth);
    }

    receive() external payable virtual override {
        // solhint-disable-next-line avoid-tx-origin
        if (msg.sender != _WETH) revert EthDepositRejected();
    }
}
