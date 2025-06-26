// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/StringUtilTest.sol";

contract StringUtilTestContract is TestHelpers {
    StringUtilTest public stringUtil;

    function setUp() public {
        stringUtil = new StringUtilTest();
    }

    function test_ToHex_Uint256() public {
        assertEq(stringUtil.toHex(0), "0x0000000000000000000000000000000000000000000000000000000000000000");
        assertEq(stringUtil.toHex(1), "0x0000000000000000000000000000000000000000000000000000000000000001");
        assertEq(stringUtil.toHex(15), "0x000000000000000000000000000000000000000000000000000000000000000F");
        assertEq(stringUtil.toHex(16), "0x0000000000000000000000000000000000000000000000000000000000000010");
        assertEq(stringUtil.toHex(255), "0x00000000000000000000000000000000000000000000000000000000000000FF");
        assertEq(stringUtil.toHex(256), "0x0000000000000000000000000000000000000000000000000000000000000100");
        assertEq(stringUtil.toHex(type(uint256).max), "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
    }

    function test_ToHex_Bytes() public {
        bytes memory data1 = hex"";
        assertEq(stringUtil.toHexBytes(data1), "0x");

        bytes memory data2 = hex"01";
        assertEq(stringUtil.toHexBytes(data2), "0x01");

        bytes memory data3 = hex"0123456789abcdef";
        assertEq(stringUtil.toHexBytes(data3), "0x0123456789ABCDEF");
    }

    function test_ToHex_SpecialCases() public {
        // Test zero with leading zeros
        assertEq(stringUtil.toHex(0), "0x0000000000000000000000000000000000000000000000000000000000000000");

        // Test various numbers
        assertEq(stringUtil.toHex(0x1234), "0x0000000000000000000000000000000000000000000000000000000000001234");
        assertEq(stringUtil.toHex(0xabcdef), "0x0000000000000000000000000000000000000000000000000000000000ABCDEF");

        // Test max values
        assertEq(
            stringUtil.toHex(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff),
            "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
        );
    }

    function test_ToHexNaive_Uint256() public {
        assertEq(stringUtil.toHexNaive(0), "0x0000000000000000000000000000000000000000000000000000000000000000");
        assertEq(stringUtil.toHexNaive(1), "0x0000000000000000000000000000000000000000000000000000000000000001");
        assertEq(stringUtil.toHexNaive(15), "0x000000000000000000000000000000000000000000000000000000000000000F");
        assertEq(stringUtil.toHexNaive(16), "0x0000000000000000000000000000000000000000000000000000000000000010");
        assertEq(stringUtil.toHexNaive(255), "0x00000000000000000000000000000000000000000000000000000000000000FF");
        assertEq(stringUtil.toHexNaive(256), "0x0000000000000000000000000000000000000000000000000000000000000100");
    }

    function test_ToHexNaive_Bytes() public {
        bytes memory data1 = hex"";
        assertEq(stringUtil.toHexNaiveBytes(data1), "0x");

        bytes memory data2 = hex"01";
        assertEq(stringUtil.toHexNaiveBytes(data2), "0x01");

        bytes memory data3 = hex"0123456789abcdef";
        assertEq(stringUtil.toHexNaiveBytes(data3), "0x0123456789ABCDEF");
    }

    function test_CompareImplementations() public {
        // Test that both implementations produce the same results
        uint256[] memory testValues = new uint256[](5);
        testValues[0] = 0;
        testValues[1] = 1;
        testValues[2] = 255;
        testValues[3] = 0x1234567890abcdef;
        testValues[4] = type(uint256).max;

        for (uint256 i = 0; i < testValues.length; i++) {
            assertEq(stringUtil.toHex(testValues[i]), stringUtil.toHexNaive(testValues[i]));
        }

        // Test bytes
        bytes memory testBytes = hex"0123456789abcdef";
        assertEq(stringUtil.toHexBytes(testBytes), "0x0123456789ABCDEF");
        assertEq(stringUtil.toHexNaiveBytes(testBytes), "0x0123456789ABCDEF");
    }
}
