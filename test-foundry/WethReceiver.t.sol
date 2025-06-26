// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/mocks/WethReceiverMock.sol";
import "../contracts/tests/mocks/WETH.sol";
import "../contracts/mixins/EthReceiver.sol";

contract WethReceiverTest is TestHelpers {
    WethReceiverMock public receiver;
    WETH public weth;

    function setUp() public {
        weth = new WETH();
        receiver = new WethReceiverMock(address(weth));

        // Fund the test contract with ETH
        vm.deal(address(this), 10 ether);
    }

    function test_Receive_AcceptsFromWETH() public {
        uint256 amount = 1 ether;

        // Fund WETH contract
        vm.deal(address(weth), amount);

        // Send ETH from WETH to receiver
        vm.prank(address(weth));
        (bool success,) = payable(address(receiver)).call{value: amount}("");
        assertTrue(success);

        // Verify ETH was received
        assertEq(address(receiver).balance, amount);
    }

    function test_Receive_RevertsFromNonWETH() public {
        // Try sending ETH directly (not from WETH)
        vm.expectRevert(EthReceiver.EthDepositRejected.selector);
        payable(address(receiver)).call{value: 1 ether}("");
    }

    function test_Receive_RevertsFromOtherContract() public {
        // Create another contract
        WethReceiverMock otherContract = new WethReceiverMock(address(weth));

        // Fund the other contract
        vm.deal(address(otherContract), 1 ether);

        // Try sending ETH from other contract
        vm.prank(address(otherContract));
        vm.expectRevert(EthReceiver.EthDepositRejected.selector);
        payable(address(receiver)).call{value: 0.5 ether}("");
    }

    function test_Receive_MultipleDepositsFromWETH() public {
        uint256 amount1 = 0.5 ether;
        uint256 amount2 = 1.5 ether;

        // Fund WETH contract
        vm.deal(address(weth), amount1 + amount2);

        // First deposit from WETH
        vm.prank(address(weth));
        (bool success1,) = payable(address(receiver)).call{value: amount1}("");
        assertTrue(success1);
        assertEq(address(receiver).balance, amount1);

        // Second deposit from WETH
        vm.prank(address(weth));
        (bool success2,) = payable(address(receiver)).call{value: amount2}("");
        assertTrue(success2);
        assertEq(address(receiver).balance, amount1 + amount2);
    }

    function test_Constructor_SetsWETHAddress() public {
        address newWeth = address(0x1234);
        WethReceiverMock newReceiver = new WethReceiverMock(newWeth);

        // Fund the new WETH address
        vm.deal(newWeth, 1 ether);

        // Should accept from the new WETH address
        vm.prank(newWeth);
        (bool success,) = payable(address(newReceiver)).call{value: 0.1 ether}("");
        assertTrue(success);

        // Should reject from the old WETH address
        vm.deal(address(weth), 1 ether);
        vm.prank(address(weth));
        vm.expectRevert(EthReceiver.EthDepositRejected.selector);
        payable(address(newReceiver)).call{value: 0.1 ether}("");
    }
}
