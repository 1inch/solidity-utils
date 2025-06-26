// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/mocks/PermitAndCallMock.sol";
import "../contracts/mocks/ERC20PermitMock.sol";
import "../contracts/tests/mocks/DaiLikePermitMock.sol";

contract PermitAndCallTest is TestHelpers {
    PermitAndCallMock public permitAndCall;
    ERC20PermitMock public token;
    DaiLikePermitMock public daiLikeToken;

    uint256 constant PRIVATE_KEY = 0x1234567890123456789012345678901234567890123456789012345678901234;
    address signer;

    event FooCalled();
    event MsgValue(uint256 value);

    function setUp() public {
        permitAndCall = new PermitAndCallMock();
        token = new ERC20PermitMock("Test Token", "TEST", address(this), 1000 ether);
        signer = vm.addr(PRIVATE_KEY);
        daiLikeToken = new DaiLikePermitMock("DAI Token", "DAI", signer, 100 ether);

        // Fund signer with tokens
        token.transfer(signer, 100 ether);
    }

    function test_PermitAndCall_StandardPermit() public {
        uint256 value = 50 ether;
        uint256 deadline = block.timestamp + 1 hours;

        // Create permit signature
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                token.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                        signer,
                        address(permitAndCall),
                        value,
                        token.nonces(signer),
                        deadline
                    )
                )
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, permitHash);

        // Prepare permit data: [token address (20 bytes)][permit data]
        bytes memory permitData = abi.encodePacked(
            address(token),
            abi.encode(signer, address(permitAndCall), value, deadline, v, r, s)
        );

        // Prepare action data (calling foo function)
        bytes memory actionData = abi.encodeWithSelector(permitAndCall.foo.selector);

        // Execute permit and call
        vm.prank(signer);
        vm.expectEmit(true, true, true, true);
        emit FooCalled();
        permitAndCall.permitAndCall(permitData, actionData);

        // Check allowance was set
        assertEq(token.allowance(signer, address(permitAndCall)), value);
    }

    function test_PermitAndCall_PayableFunction() public {
        uint256 value = 30 ether;
        uint256 deadline = block.timestamp + 1 hours;
        uint256 msgValue = 1 ether;

        // Create permit signature
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                token.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                        signer,
                        address(permitAndCall),
                        value,
                        token.nonces(signer),
                        deadline
                    )
                )
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, permitHash);

        // Prepare permit data
        bytes memory permitData = abi.encodePacked(
            address(token),
            abi.encode(signer, address(permitAndCall), value, deadline, v, r, s)
        );

        // Prepare action data (calling payableFoo function)
        bytes memory actionData = abi.encodeWithSelector(permitAndCall.payableFoo.selector);

        // Fund the test contract
        vm.deal(signer, msgValue);

        // Execute permit and call with value
        vm.prank(signer);
        vm.expectEmit(true, true, true, true);
        emit MsgValue(msgValue);
        permitAndCall.permitAndCall{value: msgValue}(permitData, actionData);
    }

    function test_PermitAndCall_DaiLikePermit() public {
        uint256 deadline = block.timestamp + 1 hours;

        // Create DAI-like permit signature
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                daiLikeToken.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        daiLikeToken.PERMIT_TYPEHASH(),
                        signer,
                        address(permitAndCall),
                        daiLikeToken.nonces(signer),
                        deadline,
                        true
                    )
                )
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, permitHash);

        // Prepare permit data for DAI-like permit
        bytes memory permitData = abi.encodePacked(
            address(daiLikeToken),
            abi.encode(signer, address(permitAndCall), daiLikeToken.nonces(signer), deadline, true, v, r, s)
        );

        // Prepare action data
        bytes memory actionData = abi.encodeWithSelector(permitAndCall.foo.selector);

        // Execute permit and call
        vm.prank(signer);
        vm.expectEmit(true, true, true, true);
        emit FooCalled();
        permitAndCall.permitAndCall(permitData, actionData);

        // Check allowance was set to max for DAI-like permit
        assertEq(daiLikeToken.allowance(signer, address(permitAndCall)), type(uint128).max);
    }

    function test_PermitAndCall_InvalidAction_Reverts() public {
        uint256 value = 10 ether;
        uint256 deadline = block.timestamp + 1 hours;

        // Create permit signature
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                token.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                        signer,
                        address(permitAndCall),
                        value,
                        token.nonces(signer),
                        deadline
                    )
                )
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, permitHash);

        // Prepare permit data
        bytes memory permitData = abi.encodePacked(
            address(token),
            abi.encode(signer, address(permitAndCall), value, deadline, v, r, s)
        );

        // Prepare invalid action data (non-existent function)
        bytes memory actionData = abi.encodeWithSelector(bytes4(0x12345678));

        // Execute should revert
        vm.prank(signer);
        vm.expectRevert();
        permitAndCall.permitAndCall(permitData, actionData);
    }
}
