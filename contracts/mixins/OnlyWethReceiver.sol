// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./EthReceiver.sol";

abstract contract OnlyWethReceiver is EthReceiver {
    address private immutable _WETH; // solhint-disable-line var-name-mixedcase

    constructor(address weth) {
        _WETH = address(weth);
    }

    function _receive() internal virtual override {
        if (msg.sender != _WETH) revert EthDepositRejected();
    }
}
