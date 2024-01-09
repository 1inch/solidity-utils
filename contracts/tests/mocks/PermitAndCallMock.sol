// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../PermitAndCall.sol";

contract PermitAndCallMock is PermitAndCall {
    event FooCalled();

    function foo() external {
        emit FooCalled();
    }
}
