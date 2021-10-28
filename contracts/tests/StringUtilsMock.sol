// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

import "../libraries/StringUtil.sol";
import "../mocks/libraries/StringUtilNaive.sol";

contract StringUtilsMock {
    function toHex(uint256 value) public returns (string memory) {
        return StringUtil.toHex(value);
    }

    function toHexBytes(bytes memory data) public returns (string memory) {
        return StringUtil.toHex(data);
    }

    function toHexNaive(uint256 value) public returns (string memory) {
        return StringUtilNaive.toHex(value);
    }

    function toHexNaiveBytes(bytes memory data) public returns (string memory) {
        return StringUtilNaive.toHex(data);
    }
}
