// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/mocks/SelfdestructEthSenderMock.sol";

contract SelfdestructEthSenderTest is TestHelpers {
    SelfdestructEthSenderMock public sender;
    address payable recipient = payable(address(0x1234));

    function setUp() public {
        sender = new SelfdestructEthSenderMock();
    }

    function test_SendEthAndSelfDestruct() public {
        uint256 amount = 1 ether;

        // Fund the sender contract
        vm.deal(address(sender), amount);
        assertEq(address(sender).balance, amount);

        uint256 recipientBalanceBefore = recipient.balance;

        // Send ETH and self-destruct
        sender.stopAndTransferBalance(recipient);

        // Verify ETH was transferred
        assertEq(recipient.balance, recipientBalanceBefore + amount);

        // Note: Post-Cancun, selfdestruct no longer destroys contract code
        // Only transfers ETH to the recipient
    }

    function test_SendEthAndSelfDestruct_ZeroBalance() public {
        // Contract has no balance
        assertEq(address(sender).balance, 0);

        uint256 recipientBalanceBefore = recipient.balance;

        // Send ETH and self-destruct
        sender.stopAndTransferBalance(recipient);

        // Verify no ETH was transferred
        assertEq(recipient.balance, recipientBalanceBefore);

        // Note: Post-Cancun, selfdestruct no longer destroys contract code
        // Only transfers ETH to the recipient
    }

    function test_SendEthAndSelfDestruct_ToContract() public {
        uint256 amount = 2 ether;

        // Create a contract recipient
        SelfdestructEthSenderMock recipientContract = new SelfdestructEthSenderMock();

        // Fund the sender contract
        vm.deal(address(sender), amount);

        uint256 recipientBalanceBefore = address(recipientContract).balance;

        // Send ETH and self-destruct
        sender.stopAndTransferBalance(payable(address(recipientContract)));

        // Verify ETH was transferred
        assertEq(address(recipientContract).balance, recipientBalanceBefore + amount);

        // Note: Post-Cancun, selfdestruct no longer destroys contract code
        // Only transfers ETH to the recipient
        // Both sender and recipient contracts still have code
    }
}
