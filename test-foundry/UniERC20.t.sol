// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/mocks/UniERC20Helper.sol";
import "../contracts/mocks/TokenMock.sol";

contract UniERC20Test is TestHelpers {
    UniERC20Wrapper public wrapper;
    TokenMock public token;

    address alice = address(0x1);
    address bob = address(0x2);

    function setUp() public {
        token = new TokenMock("Test", "TST");
        wrapper = new UniERC20Wrapper(IERC20(address(0))); // For ETH tests

        // Fund alice with ETH and tokens
        vm.deal(alice, 10 ether);
        token.mint(alice, 1000e18);

        // Fund wrapper with ETH
        vm.deal(address(wrapper), 10 ether);
    }

    function test_IsETH() public {
        wrapper = new UniERC20Wrapper(IERC20(address(0)));
        assertTrue(wrapper.isETH());

        wrapper = new UniERC20Wrapper(IERC20(address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)));
        assertTrue(wrapper.isETH());

        wrapper = new UniERC20Wrapper(IERC20(address(token)));
        assertFalse(wrapper.isETH());
    }

    function test_UniBalanceOf_ETH() public {
        wrapper = new UniERC20Wrapper(IERC20(address(0)));
        assertEq(wrapper.balanceOf(alice), 10 ether);

        wrapper = new UniERC20Wrapper(IERC20(address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)));
        assertEq(wrapper.balanceOf(alice), 10 ether);
    }

    function test_UniBalanceOf_Token() public {
        wrapper = new UniERC20Wrapper(IERC20(address(token)));
        assertEq(wrapper.balanceOf(alice), 1000e18);
    }

    function test_UniTransfer_ETH() public {
        wrapper = new UniERC20Wrapper(IERC20(address(0)));
        vm.deal(address(wrapper), 10 ether);

        uint256 bobBalanceBefore = bob.balance;
        uint256 wrapperBalanceBefore = address(wrapper).balance;

        wrapper.transfer(payable(bob), 1 ether);

        assertEq(bob.balance, bobBalanceBefore + 1 ether);
        assertEq(address(wrapper).balance, wrapperBalanceBefore - 1 ether);
    }

    function test_UniTransfer_Token() public {
        wrapper = new UniERC20Wrapper(IERC20(address(token)));

        vm.startPrank(alice);
        token.approve(address(wrapper), 100e18);
        vm.stopPrank();

        uint256 bobBalanceBefore = token.balanceOf(bob);

        wrapper.transferFrom(payable(alice), bob, 100e18);

        assertEq(token.balanceOf(bob), bobBalanceBefore + 100e18);
        assertEq(token.balanceOf(alice), 900e18);
    }

    function test_UniApprove_ETH() public {
        // ETH approve should revert
        wrapper = new UniERC20Wrapper(IERC20(address(0)));
        vm.expectRevert(UniERC20.ApproveCalledOnETH.selector);
        wrapper.approve(alice, type(uint256).max);

        wrapper = new UniERC20Wrapper(IERC20(address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)));
        vm.expectRevert(UniERC20.ApproveCalledOnETH.selector);
        wrapper.approve(alice, type(uint256).max);
    }

    function test_UniApprove_Token() public {
        wrapper = new UniERC20Wrapper(IERC20(address(token)));
        wrapper.approve(alice, 1000e18);
        assertEq(token.allowance(address(wrapper), alice), 1000e18);
    }

    function test_UniName() public {
        // Test with regular token
        wrapper = new UniERC20Wrapper(IERC20(address(token)));
        assertEq(wrapper.name(), "Test");

        // Test with ETH
        wrapper = new UniERC20Wrapper(IERC20(address(0)));
        assertEq(wrapper.name(), "ETH");
    }

    function test_UniSymbol() public {
        // Test with regular token
        wrapper = new UniERC20Wrapper(IERC20(address(token)));
        assertEq(wrapper.symbol(), "TST");

        // Test with ETH
        wrapper = new UniERC20Wrapper(IERC20(address(0)));
        assertEq(wrapper.symbol(), "ETH");
    }
}
