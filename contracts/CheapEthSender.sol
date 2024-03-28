// SPDX-License-Identifier: MIT

pragma solidity ^0.8.25;


contract CheapEthSender {
    receive() external payable {
    }

    function sendAllEthers(address payable receiver) external {
        selfdestruct(receiver);
    }
}
