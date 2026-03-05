// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../../mixins/Multicall.sol";

contract MulticallMock is Multicall {
    error CustomError(string message);

    uint256 public value;
    address public lastSender;

    function setValue(uint256 _value) external {
        value = _value;
        lastSender = msg.sender;
    }

    function getValue() external view returns (uint256) {
        return value;
    }

    function increment() external {
        value++;
    }

    function revertWithMessage(string calldata message) external pure {
        revert CustomError(message);
    }

    function revertEmpty() external pure {
        revert(); // solhint-disable-line reason-string
    }
}
