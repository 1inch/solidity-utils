// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../libraries/RevertReasonParser.sol";
import "../mocks/libraries/RevertReasonParserExpensive.sol";

contract RevertReasonParserTest {
    function emptyRevert() external pure  {
        revert();  // solhint-disable-line reason-string
    }

    function emptyStringRevert() external pure  {
        revert("");
    }

    function nonEmptyRevert() external pure {
        revert("reason");
    }

    function assertion() external pure {
        assert(false);
    }

    function longStringRevert() external pure {
        // solhint-disable-next-line reason-string
        revert("Very long text to test for reverts that return string of more than 32 bytes length");
    }

    function withoutAssertion() external pure {
        assert(true);
    }

    function testEmptyRevert() external view {
        _test(this.emptyRevert, "Unknown(0x)");
    }

    function testEmptyStringRevert() external view {
        _test(this.emptyStringRevert, "Error()");
    }

    function testNonEmptyRevert() external view {
        _test(this.nonEmptyRevert, "Error(reason)");
    }

    function testAssertion() external view {
        _test(this.assertion, "Panic(0x0000000000000000000000000000000000000000000000000000000000000001)");
    }

    function testLongStringRevert() external view {
        _test(this.longStringRevert, "Error(Very long text to test for reverts that return string of more than 32 bytes length)");
    }

    function testParseWithThrow() external view {
        try this.nonEmptyRevert() { // solhint-disable-line no-empty-blocks
        } catch (bytes memory reason) {
            bytes32 invalidReasonPart1;
            bytes32 invalidReasonPart2;
            bytes32 invalidReasonPart3;
            assembly {  // solhint-disable-line no-inline-assembly
                invalidReasonPart1 := mload(add(reason, 0x20))
                invalidReasonPart2 := mload(add(reason, 0x40))
                invalidReasonPart3 := mload(add(reason, 0x40))
            }
            bytes memory invalidReason = abi.encodePacked(invalidReasonPart1, invalidReasonPart2, invalidReasonPart3);
            RevertReasonParser.parse(invalidReason, "");
        }
    }

    function testWithThrow() external view {
        _test(this.withoutAssertion, "Error(reason)");
    }

    function testGasCost() external payable {
        try this.assertion() { // solhint-disable-line no-empty-blocks
        } catch (bytes memory reason) {
            uint gasLeftBeforeParse = gasleft();
            RevertReasonParser.parse(reason, "");
            uint gasLeftAfterParse = gasleft();
            uint revertReasonParserCost = gasLeftBeforeParse - gasLeftAfterParse;
            
            gasLeftBeforeParse = gasleft();
            RevertReasonParserExpensive.parse(reason, "");
            gasLeftAfterParse = gasleft();
            uint revertReasonParserExpensiveCost = gasLeftBeforeParse - gasLeftAfterParse;
            
            require(
                revertReasonParserCost < revertReasonParserExpensiveCost,
                string(abi.encodePacked("Expected { revertReasonParserCost < revertReasonParserExpensiveCost }, but got { ", revertReasonParserCost, " < ", revertReasonParserExpensiveCost, "}"))
            );
        }
    }

    function testGasParse() external view {
        _testGas(this.assertion, RevertReasonParser.parse, 3336);
    }

    function testGasExpensiveParse() external view {
        _testGas(this.assertion, RevertReasonParserExpensive.parse, 26212);
    }

    function _test(function() external pure testFunction, string memory expectedReason) private pure {
        try testFunction() {
            revert("testFunctions without throw");
        } catch (bytes memory reason) {
            string memory parsedReason = RevertReasonParser.parse(reason, "");
            require(
                keccak256(abi.encodePacked(expectedReason)) == keccak256(abi.encodePacked(parsedReason)),
                string(abi.encodePacked("Expected { ", expectedReason, " }, but got { ", parsedReason, " }"))
            );
        }
    }

    function _testGas(
        function() external pure assertFunction,
        function(bytes memory, string memory) internal pure returns (string memory) testFunction, 
        uint256 gasAmount
    ) private view {
        try assertFunction() { // solhint-disable-line no-empty-blocks
        } catch (bytes memory reason) {
            uint256 gasLeftBeforeParse = gasleft();
            testFunction(reason, "");
            uint256 gasLeftAfterParse = gasleft();
            require(
                gasLeftBeforeParse - gasLeftAfterParse == gasAmount,
                string(abi.encodePacked("Expected { ", gasAmount, " }, but got { ", gasLeftBeforeParse - gasLeftAfterParse, " }"))
            );   
        }
    }
}
