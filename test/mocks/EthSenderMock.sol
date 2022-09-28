// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../contracts/libraries/RevertReasonForwarder.sol";

contract EthSenderMock {
    function transfer(address payable to) public payable {
        (bool success, ) = to.call{value: msg.value}("");
        if (!success) RevertReasonForwarder.reRevert();
    }
}
