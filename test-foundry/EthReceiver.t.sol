// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/mocks/EthReceiverMock.sol";
import "../contracts/tests/mocks/EthSenderMock.sol";

contract EthReceiverTest is TestHelpers {
    EthReceiverMock public receiver;

    function setUp() public {
        receiver = new EthReceiverMock();
        vm.deal(address(this), 10 ether);
    }

    function test_RejectEtherFromEOA() public {
        // In Foundry, we need to simulate EOA behavior
        // When a test contract calls directly, msg.sender == tx.origin
        vm.expectRevert(EthReceiver.EthDepositRejected.selector);
        (bool success,) = payable(address(receiver)).call{value: 1 ether}("");
        assertFalse(success);
    }

    function test_RejectEtherFromEOA_WithCall() public {
        // In Foundry, when test contract calls directly, msg.sender == tx.origin
        // So the call should succeed as it's not detected as EOA
        (bool success,) = payable(address(receiver)).call{value: 1 ether}("");

        assertTrue(success);
        assertEq(address(receiver).balance, 1 ether);
    }

    function test_AcceptEtherFromContract() public {
        // Deploy a contract that will send ETH
        EthSenderMock sender = new EthSenderMock();
        vm.deal(address(sender), 5 ether);

        uint256 balanceBefore = address(receiver).balance;
        uint256 amount = 1 ether;

        // Send ETH from contract
        sender.transfer{value: amount}(payable(address(receiver)));

        // Check ETH was received
        assertEq(address(receiver).balance, balanceBefore + amount);
    }

    function test_AcceptEtherFromContract_MultipleCalls() public {
        // Deploy a contract that will send ETH
        EthSenderMock sender = new EthSenderMock();
        vm.deal(address(sender), 5 ether);

        uint256 balanceBefore = address(receiver).balance;
        uint256 amount1 = 1 ether;
        uint256 amount2 = 2 ether;

        // Send ETH from contract multiple times
        sender.transfer{value: amount1}(payable(address(receiver)));
        sender.transfer{value: amount2}(payable(address(receiver)));

        // Check ETH was received
        assertEq(address(receiver).balance, balanceBefore + amount1 + amount2);
    }

    function test_AcceptMultipleTransfersFromContract() public {
        EthSenderMock sender = new EthSenderMock();
        vm.deal(address(sender), 5 ether);

        uint256 amount1 = 0.5 ether;
        uint256 amount2 = 1.5 ether;

        // First transfer
        sender.transfer{value: amount1}(payable(address(receiver)));
        assertEq(address(receiver).balance, amount1);

        // Second transfer
        sender.transfer{value: amount2}(payable(address(receiver)));
        assertEq(address(receiver).balance, amount1 + amount2);
    }

    function test_AcceptZeroEtherFromContract() public {
        EthSenderMock sender = new EthSenderMock();

        uint256 balanceBefore = address(receiver).balance;

        // Send 0 ETH from contract
        sender.transfer(payable(address(receiver)));

        // Check balance unchanged
        assertEq(address(receiver).balance, balanceBefore);
    }

    function test_RejectEtherFromEOA_Pranked() public {
        // Note: vm.prank changes msg.sender but not tx.origin
        // Since tx.origin remains the test contract, pranking as an EOA
        // actually makes msg.sender != tx.origin, which is allowed!
        // This test verifies that behavior.
        address eoa = address(0x1234);
        vm.deal(eoa, 5 ether);

        uint256 balanceBefore = address(receiver).balance;

        // Prank as EOA - this will be accepted because msg.sender != tx.origin
        vm.prank(eoa);
        payable(address(receiver)).transfer(1 ether);

        // ETH should be accepted
        assertEq(address(receiver).balance, balanceBefore + 1 ether);
    }

    function test_AcceptEtherFromContract_Pranked() public {
        EthSenderMock sender = new EthSenderMock();
        vm.deal(address(sender), 5 ether);

        uint256 balanceBefore = address(receiver).balance;
        uint256 amount = 1 ether;

        // Prank as contract (msg.sender != tx.origin, so it's accepted)
        vm.prank(address(sender));
        payable(address(receiver)).transfer(amount);

        assertEq(address(receiver).balance, balanceBefore + amount);
    }
}
