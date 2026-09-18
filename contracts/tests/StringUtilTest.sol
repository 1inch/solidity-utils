// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { StringUtil } from "../libraries/StringUtil.sol";
import { StringUtilNaive } from "./libraries/StringUtilNaive.sol";
contract StringUtilTest {
    function toHex(uint256 value)
        external
        pure
        returns (string memory)
    {
        return StringUtil.toHex(value);
    }

    function toHexBytes(bytes calldata data)
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

    function toHexNaiveBytes(bytes calldata data)
        external
        pure
        returns (string memory)
    {
        return StringUtilNaive.toHex(data);
    }
}
