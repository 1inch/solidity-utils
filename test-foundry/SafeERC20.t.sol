// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/mocks/SafeERC20Helper.sol";
import "../contracts/tests/mocks/WETH.sol";
import "../contracts/mocks/TokenMock.sol";
import "../contracts/mocks/ERC20PermitMock.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Simple mock contract for testing
contract MockContract {}

// Modified wrapper to use a valid spender address
contract ModifiedSafeERC20Wrapper {
    using SafeERC20 for IERC20;

    IERC20 private _token;
    address constant SPENDER = address(0x1234);

    constructor(IERC20 token) {
        _token = token;
    }

    function balanceOf() external view returns (uint256) {
        return _token.safeBalanceOf(address(0));
    }

    function transfer() external {
        _token.safeTransfer(address(0), 0);
    }

    function transferFrom() external {
        _token.safeTransferFrom(address(0), address(0), 0);
    }

    function approve(uint256 amount) external {
        _token.forceApprove(SPENDER, amount);
    }

    function increaseAllowance(uint256 amount) external {
        _token.safeIncreaseAllowance(SPENDER, amount);
    }

    function decreaseAllowance(uint256 amount) external {
        _token.safeDecreaseAllowance(SPENDER, amount);
    }

    function permit(
        address, /* owner */
        address, /* spender */
        uint256, /* value */
        uint256, /* deadline */
        uint8, /* v */
        bytes32, /* r */
        bytes32 /* s */
    ) external {
        _token.safePermit(msg.data[4:]);
    }

    function allowance() external view returns (uint256) {
        return _token.allowance(address(this), SPENDER);
    }
}

contract SafeERC20Test is TestHelpers {
    SafeERC20Wrapper public wrapper;
    ModifiedSafeERC20Wrapper public modifiedWrapper;
    address public spender = address(0x1234);

    function setUp() public {
        wrapper = new SafeERC20Wrapper(IERC20(address(0)));
    }

    // Test with address that has no contract code
    function test_NoContractCode_RevertsOnTransfer() public {
        wrapper = new SafeERC20Wrapper(IERC20(spender));
        vm.expectRevert(SafeERC20.SafeTransferFailed.selector);
        wrapper.transfer();
    }

    function test_NoContractCode_RevertsOnTransferFrom() public {
        wrapper = new SafeERC20Wrapper(IERC20(spender));
        vm.expectRevert(SafeERC20.SafeTransferFromFailed.selector);
        wrapper.transferFrom();
    }

    function test_NoContractCode_RevertsOnApprove() public {
        wrapper = new SafeERC20Wrapper(IERC20(spender));
        vm.expectRevert(SafeERC20.ForceApproveFailed.selector);
        wrapper.approve(0);
    }

    // Tests with return false mock
    function test_ReturnFalseMock_RevertsOnTransfer() public {
        ERC20ReturnFalseMock token = new ERC20ReturnFalseMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));
        vm.expectRevert(SafeERC20.SafeTransferFailed.selector);
        wrapper.transfer();
    }

    function test_ReturnFalseMock_RevertsOnTransferFrom() public {
        ERC20ReturnFalseMock token = new ERC20ReturnFalseMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));
        vm.expectRevert(SafeERC20.SafeTransferFromFailed.selector);
        wrapper.transferFrom();
    }

    function test_ReturnFalseMock_RevertsOnApprove() public {
        ERC20ReturnFalseMock token = new ERC20ReturnFalseMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));
        vm.expectRevert(SafeERC20.ForceApproveFailed.selector);
        wrapper.approve(100);
    }

    function test_ReturnFalseMock_RevertsOnIncreaseAllowance() public {
        ERC20ReturnFalseMock token = new ERC20ReturnFalseMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));
        vm.expectRevert();
        wrapper.increaseAllowance(0);
    }

    function test_ReturnFalseMock_RevertsOnDecreaseAllowance() public {
        ERC20ReturnFalseMock token = new ERC20ReturnFalseMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));
        vm.expectRevert();
        wrapper.decreaseAllowance(0);
    }

    // Tests with return true mock
    function test_ReturnTrueMock_Transfer() public {
        ERC20ReturnTrueMock token = new ERC20ReturnTrueMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));
        wrapper.transfer();
    }

    function test_ReturnTrueMock_TransferFrom() public {
        ERC20ReturnTrueMock token = new ERC20ReturnTrueMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));
        wrapper.transferFrom();
    }

    function test_ReturnTrueMock_Approve() public {
        ERC20ReturnTrueMock token = new ERC20ReturnTrueMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));
        wrapper.approve(100);
    }

    // Tests with no return mock
    function test_NoReturnMock_Transfer() public {
        ERC20NoReturnMock token = new ERC20NoReturnMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));
        wrapper.transfer();
    }

    function test_NoReturnMock_TransferFrom() public {
        ERC20NoReturnMock token = new ERC20NoReturnMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));
        wrapper.transferFrom();
    }

    function test_NoReturnMock_Approve() public {
        ERC20NoReturnMock token = new ERC20NoReturnMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));
        wrapper.approve(100);
    }

    // Test transferFromUniversal
    function test_NoReturnMock_TransferFromUniversal() public {
        ERC20NoReturnMock token = new ERC20NoReturnMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));
        wrapper.transferFromUniversal(false); // without permit2
    }

    // Tests for forceApprove with ERC20ThroughZeroApprove
    function test_ForceApprove_WithNonZeroAllowance() public {
        ERC20ThroughZeroApprove token = new ERC20ThroughZeroApprove();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));

        // First approve
        wrapper.approve(100);
        assertEq(token.allowance(address(wrapper), address(0)), 100);

        // Second approve should go through zero first
        wrapper.approve(200);
        assertEq(token.allowance(address(wrapper), address(0)), 200);
    }

    // Tests for increase/decrease allowance
    function test_IncreaseAllowance() public {
        // Use ERC20PermitMock which has proper allowance tracking
        ERC20PermitMock token = new ERC20PermitMock("Test", "TEST", address(this), 1000 ether);
        modifiedWrapper = new ModifiedSafeERC20Wrapper(IERC20(address(token)));

        // First set initial allowance using the wrapper
        modifiedWrapper.approve(100);

        modifiedWrapper.increaseAllowance(50);
        assertEq(token.allowance(address(modifiedWrapper), spender), 150);
    }

    function test_DecreaseAllowance() public {
        // Use ERC20PermitMock which has proper allowance tracking
        ERC20PermitMock token = new ERC20PermitMock("Test", "TEST", address(this), 1000 ether);
        modifiedWrapper = new ModifiedSafeERC20Wrapper(IERC20(address(token)));

        // First approve to set initial allowance
        modifiedWrapper.approve(100);

        modifiedWrapper.decreaseAllowance(50);
        assertEq(token.allowance(address(modifiedWrapper), spender), 50);
    }

    function test_DecreaseAllowance_Underflow() public {
        // Use ERC20PermitMock which has proper allowance tracking
        ERC20PermitMock token = new ERC20PermitMock("Test", "TEST", address(this), 1000 ether);
        modifiedWrapper = new ModifiedSafeERC20Wrapper(IERC20(address(token)));

        // First approve to set initial allowance
        modifiedWrapper.approve(50);

        vm.expectRevert(SafeERC20.SafeDecreaseAllowanceFailed.selector);
        modifiedWrapper.decreaseAllowance(100);
    }

    // Tests for WETH wrapper
    function test_SafeWETH_Deposit() public {
        WETH weth = new WETH();
        SafeWETHWrapper wethWrapper = new SafeWETHWrapper(IWETH(address(weth)));

        uint256 amount = 1 ether;
        wethWrapper.deposit{value: amount}();
        assertEq(weth.balanceOf(address(wethWrapper)), amount);
    }

    function test_SafeWETH_Withdraw() public {
        WETH weth = new WETH();
        SafeWETHWrapper wethWrapper = new SafeWETHWrapper(IWETH(address(weth)));

        uint256 amount = 1 ether;
        wethWrapper.deposit{value: amount}();

        uint256 balanceBefore = address(wethWrapper).balance;
        wethWrapper.withdraw(amount);
        assertEq(address(wethWrapper).balance, balanceBefore + amount);
    }

    function test_SafeWETH_WithdrawTo() public {
        WETH weth = new WETH();
        SafeWETHWrapper wethWrapper = new SafeWETHWrapper(IWETH(address(weth)));
        address recipient = address(0x1234);

        uint256 amount = 1 ether;
        wethWrapper.deposit{value: amount}();

        uint256 balanceBefore = recipient.balance;
        wethWrapper.withdrawTo(amount, recipient);
        assertEq(recipient.balance, balanceBefore + amount);
    }

    // Tests for safeBalanceOf
    function test_SafeBalanceOf_WithValidToken() public {
        TokenMock token = new TokenMock("Test", "TEST");
        token.mint(address(this), 1000);

        ERC20WithSafeBalance balanceWrapper = new ERC20WithSafeBalance(IERC20(address(token)));

        // Both should return the same value for valid tokens
        uint256 normalBalance = token.balanceOf(address(this));
        uint256 safeBalance = balanceWrapper.safeBalanceOf(address(this));
        assertEq(normalBalance, safeBalance);
        assertEq(normalBalance, 1000);
    }

    function test_SafeBalanceOf_WithInvalidToken() public {
        // Deploy a mock contract that will be used as the token but without balance functions
        address mockToken = address(new MockContract());
        ERC20WithSafeBalance balanceWrapper = new ERC20WithSafeBalance(IERC20(mockToken));

        // The safeBalanceOf function reverts when the token doesn't implement balanceOf properly
        // This is the expected behavior based on the implementation
        vm.expectRevert();
        balanceWrapper.safeBalanceOf(address(this));
    }

    // Test permit functionality
    function test_Permit_WithValidSignature() public {
        ERC20PermitNoRevertMock token = new ERC20PermitNoRevertMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));

        // Create permit data with proper domain
        uint256 chainId = token.getChainId();
        uint256 deadline = block.timestamp + 1 hours;
        address owner = vm.addr(1);
        uint256 nonce = token.nonces(owner);

        // Prepare permit data
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                owner,
                spender,
                100,
                nonce,
                deadline
            )
        );

        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("ERC20PermitNoRevertMock")),
                keccak256(bytes("1")),
                chainId,
                address(token)
            )
        );

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(1, digest);

        // Test valid permit
        wrapper.permit(owner, spender, 100, deadline, v, r, s);

        // For ERC20PermitNoRevertMock, the permit should be accepted
        assertEq(token.nonces(owner), 1);
        assertEq(token.allowance(owner, spender), 100);
    }

    // Test permit with reused signature
    function test_Permit_ReusedSignature() public {
        ERC20PermitNoRevertMock token = new ERC20PermitNoRevertMock();
        wrapper = new SafeERC20Wrapper(IERC20(address(token)));

        uint256 chainId = token.getChainId();
        uint256 deadline = block.timestamp + 1 hours;

        // Create valid signature
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                vm.addr(1),
                spender,
                100,
                0,
                deadline
            )
        );

        bytes32 domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("ERC20PermitNoRevertMock")),
                keccak256(bytes("1")),
                chainId,
                address(token)
            )
        );

        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(1, digest);

        // First use should work
        wrapper.permit(vm.addr(1), spender, 100, deadline, v, r, s);
        assertEq(token.nonces(vm.addr(1)), 1);

        // Reuse should not revert (due to ERC20PermitNoRevertMock behavior) but nonce shouldn't change
        wrapper.permit(vm.addr(1), spender, 100, deadline, v, r, s);
        assertEq(token.nonces(vm.addr(1)), 1); // nonce unchanged
    }
}
