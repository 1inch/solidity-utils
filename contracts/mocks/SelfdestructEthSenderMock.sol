// SPDX-License-Identifier: MIT

pragma solidity ^0.8.25;

import "../mixins/SelfdestructEthSender.sol";

contract SelfdestructEthSenderMock is SelfdestructEthSender {
    error ETHTransferFailed();

    receive() external payable {}

    function transferBalance(address payable receiver) external payable {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = receiver.call{value: address(this).balance}("");
        if (!success) revert ETHTransferFailed();
    }
}
