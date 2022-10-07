// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../libraries/RevertReasonForwarder.sol";

contract EthSenderMock {
    function transfer(address payable to) public payable {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = to.call{value: msg.value}("");
        if (!success) RevertReasonForwarder.reRevert();
    }
}
