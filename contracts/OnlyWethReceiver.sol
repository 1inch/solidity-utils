// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

import "./interfaces/IWETH.sol";

abstract contract OnlyWethReceiver {
    error EthDepositRejected();

    IWETH internal immutable _WETH;  // solhint-disable-line var-name-mixedcase

    constructor(IWETH weth) {
        _WETH = weth;
    }

    receive() external payable {
        // solhint-disable-next-line avoid-tx-origin
        if (msg.sender != address(_WETH)) revert EthDepositRejected();
    }
}
