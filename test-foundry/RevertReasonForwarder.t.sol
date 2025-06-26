// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/mocks/RevertReasonForwarderMock.sol";

// Contract to help with testing that can receive ETH
contract PayableRevertReasonForwarderHelper {
    error RevertReason();

    // Add receive to accept ETH
    receive() external payable {}

    function revertWithReason() external payable {
        revert RevertReason();
    }
}

contract RevertReasonForwarderTest is TestHelpers {
    RevertReasonForwarderMock public forwarder;
    PayableRevertReasonForwarderHelper public helper;

    // Add receive function to accept ETH
    receive() external payable {}

    function setUp() public {
        helper = new PayableRevertReasonForwarderHelper();
        forwarder = new RevertReasonForwarderMock(address(helper));
    }

    function test_ReRevert_ForwardsRevert() public {
        // The helper's revertWithReason will revert with RevertReason() error
        vm.expectRevert(PayableRevertReasonForwarderHelper.RevertReason.selector);
        forwarder.reRevert();
    }

    function test_ReReason_ReturnsReasonBytes() public {
        // Call reReason which internally calls the helper and catches the revert
        bytes memory reasonBytes = forwarder.reReason();

        // The reason should contain the error selector
        assertEq(reasonBytes, abi.encodeWithSelector(PayableRevertReasonForwarderHelper.RevertReason.selector));
    }

    function test_ReRevert_WithValue() public {
        uint256 amount = 1 ether;
        vm.deal(address(this), amount);

        // Should forward the revert even when called with value
        vm.expectRevert(abi.encodeWithSelector(PayableRevertReasonForwarderHelper.RevertReason.selector));
        forwarder.reRevert{value: amount}();
    }

    function test_ReReason_WithValue() public {
        uint256 amount = 0.5 ether;
        vm.deal(address(this), amount);

        // Call reReason with value
        bytes memory reasonBytes = forwarder.reReason{value: amount}();

        // Should still return the error data
        assertEq(reasonBytes, abi.encodeWithSelector(PayableRevertReasonForwarderHelper.RevertReason.selector));
    }

    function test_MultipleCallsToReRevert() public {
        // First call
        vm.expectRevert(PayableRevertReasonForwarderHelper.RevertReason.selector);
        forwarder.reRevert();

        // Second call should work the same
        vm.expectRevert(PayableRevertReasonForwarderHelper.RevertReason.selector);
        forwarder.reRevert();
    }

    function test_ReRevert_GasForwarding() public {
        // Test that gas is properly forwarded through the call chain
        uint256 gasLimit = 100000;

        vm.expectRevert(PayableRevertReasonForwarderHelper.RevertReason.selector);
        forwarder.reRevert{gas: gasLimit}();
    }
}
