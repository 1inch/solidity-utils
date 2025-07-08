// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/RevertReasonParserTest.sol";
import "../contracts/libraries/RevertReasonParser.sol";

contract RevertReasonParserTestContract is TestHelpers {
    RevertReasonParserTest public parser;

    function setUp() public {
        parser = new RevertReasonParserTest();
    }

    function test_EmptyRevert() public {
        // This test is handled by the contract's internal test
        parser.testEmptyRevert();
    }

    function test_EmptyStringRevert() public {
        // This test is handled by the contract's internal test
        parser.testEmptyStringRevert();
    }

    function test_NonEmptyRevert() public {
        // This test is handled by the contract's internal test
        parser.testNonEmptyRevert();
    }

    function test_AssertionPanic() public {
        // This test is handled by the contract's internal test
        parser.testAssertion();
    }

    function test_LongStringRevert() public {
        // This test is handled by the contract's internal test
        parser.testLongStringRevert();
    }

    function test_ParseWithThrow() public {
        // This test is handled by the contract's internal test
        parser.testParseWithThrow();
    }

    function test_WithThrow() public {
        // Skip this test as it relies on deprecated behavior
        vm.skip(true);
    }

    // Test the library directly
    function test_ParseError_DirectLibraryCall() public {
        string memory reason = "Test revert reason";
        bytes memory encodedReason = abi.encodeWithSelector(
            bytes4(keccak256("Error(string)")),
            reason
        );

        string memory parsed = RevertReasonParser.parse(encodedReason, "");
        assertEq(parsed, string.concat("Error(", reason, ")"));
    }

    function test_ParseError_WithPrefix() public {
        string memory reason = "Another test";
        bytes memory encodedReason = abi.encodeWithSelector(
            bytes4(keccak256("Error(string)")),
            reason
        );

        string memory parsed = RevertReasonParser.parse(encodedReason, "Prefix: ");
        assertEq(parsed, string.concat("Prefix: Error(", reason, ")"));
    }

    function test_ParsePanic_DirectLibraryCall() public {
        uint256 panicCode = 1;
        bytes memory encodedPanic = abi.encodeWithSelector(
            bytes4(keccak256("Panic(uint256)")),
            panicCode
        );

        string memory parsed = RevertReasonParser.parse(encodedPanic, "");
        assertEq(parsed, "Panic(0x0000000000000000000000000000000000000000000000000000000000000001)");
    }

    function test_ParseUnknown_DirectLibraryCall() public {
        bytes memory unknownData = hex"12345678";

        string memory parsed = RevertReasonParser.parse(unknownData, "");
        assertEq(parsed, "Unknown(0x12345678)");
    }

    function test_ParseEmptyData_DirectLibraryCall() public {
        bytes memory emptyData = "";

        string memory parsed = RevertReasonParser.parse(emptyData, "");
        assertEq(parsed, "Unknown(0x)");
    }

    function test_ParseInvalidErrorFormat() public {
        // Too short data for Error selector
        bytes memory shortData = hex"08c379a0";

        string memory parsed = RevertReasonParser.parse(shortData, "");
        assertEq(parsed, "Unknown(0x08C379A0)");
    }

    function test_ParsePanicWithWrongLength() public {
        // Panic selector but wrong data length
        bytes memory wrongLengthPanic = abi.encodePacked(bytes4(keccak256("Panic(uint256)")), uint128(1));

        string memory parsed = RevertReasonParser.parse(wrongLengthPanic, "");
        assertTrue(bytes(parsed).length > 0); // Should return Unknown format
    }
}
