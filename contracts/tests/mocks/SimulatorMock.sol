// SPDX-License-Identifier: MIT
// solhint-disable one-contract-per-file
pragma solidity ^0.8.30;

import "../../mixins/Simulator.sol";

contract SimulatorTarget {
    uint256 public value;

    function setValue(uint256 _value) external {
        value = _value;
    }

    function getValue() external view returns (uint256) {
        return value;
    }

    function revertWithMessage(string calldata message) external pure {
        revert(message);
    }

    function returnData(bytes calldata data) external pure returns (bytes memory) {
        return data;
    }
}

contract SimulatorMock is Simulator {
    uint256 public value;

    function setValue(uint256 _value) external {
        value = _value;
    }

    function getValue() external view returns (uint256) {
        return value;
    }
}
