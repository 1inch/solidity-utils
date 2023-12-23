// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../libraries/StringUtil.sol";
import "./libraries/StringUtilNaive.sol";
import "../GasChecker.sol";

contract StringUtilTest {
    function toHex(uint256 value)
        external
        view
        returns (string memory hexString, uint256 gasUsed)
    {
        gasUsed = gasleft();

        hexString = StringUtil.toHex(value);

        unchecked {
            gasUsed -= gasleft();
        }
    }

    function toHexBytes(bytes memory data)
        external
        view
        returns (string memory hexString, uint256 gasUsed)
    {
        gasUsed = gasleft();
        
        hexString = StringUtil.toHex(data);

        unchecked {
            gasUsed -= gasleft();
        }
    }

    function toHexNaive(uint256 value)
        external
        view
        returns (string memory hexString, uint256 gasUsed)
    {
        gasUsed = gasleft();

        hexString = StringUtilNaive.toHex(value);

        unchecked {
            gasUsed -= gasleft();
        }
    }

    function toHexNaiveBytes(bytes memory data)
        external
        view
        returns (string memory hexString, uint256 gasUsed)
    {
        gasUsed = gasleft();

        hexString = StringUtilNaive.toHex(data);

        unchecked {
            gasUsed -= gasleft();
        }
    }
}
