// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../mixins/PermitAndCall.sol";

contract PermitAndCallMock is PermitAndCall {
    event FooCalled();
    event MsgValue(uint256 value);

    function foo() external {
        emit FooCalled();
    }

    function payableFoo() external payable {
        emit MsgValue(msg.value);
    }
}
