// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

abstract contract EthReceiver {
    error EthDepositRejected();

    receive() external payable virtual {
        // solhint-disable-next-line avoid-tx-origin
        if (msg.sender == tx.origin) revert EthDepositRejected();
    }
}
