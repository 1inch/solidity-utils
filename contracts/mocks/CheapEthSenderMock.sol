// SPDX-License-Identifier: MIT

pragma solidity ^0.8.25;

import "../CheapEthSender.sol";

contract CheapEthSenderMock is CheapEthSender {
    error ETHTransferFailed();

    function alive() external pure returns(uint256) {
        return 1;
    }

    function sendEthers(address payable receiver) external payable {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = receiver.call{value: address(this).balance}("");
        if (!success) revert ETHTransferFailed();
    }
}
