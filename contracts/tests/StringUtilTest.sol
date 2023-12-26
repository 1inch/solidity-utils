// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../libraries/StringUtil.sol";
import "./libraries/StringUtilNaive.sol";

contract StringUtilTest {
    function toHex(uint256 value)
        external
        pure
        returns (string memory)
    {
        return StringUtil.toHex(value);
    }

    function toHexBytes(bytes memory data)
        external
        pure
        returns (string memory)
    {
        return StringUtil.toHex(data);
    }

    function toHexNaive(uint256 value)
        external
        pure
        returns (string memory)
    {
        return StringUtilNaive.toHex(value);
    }

    function toHexNaiveBytes(bytes memory data)
        external
        pure
        returns (string memory)
    {
        return StringUtilNaive.toHex(data);
    }
}
