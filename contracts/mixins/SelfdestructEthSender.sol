// SPDX-License-Identifier: MIT

pragma solidity ^0.8.25;


abstract contract SelfdestructEthSender {
    constructor() {
        // tload is done to verify that the EVM is cancun-compatible
        assembly ("memory-safe") {
            pop(tload(0))
        }
    }

    function stopAndTransferBalance(address payable receiver) external {
        selfdestruct(receiver);
    }
}
