// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/mocks/PermitableMock.sol";
import "../contracts/mocks/ERC20PermitMock.sol";
import "../contracts/tests/mocks/DaiLikePermitMock.sol";
import "../contracts/tests/mocks/USDCLikePermitMock.sol";

contract PermitableTest is TestHelpers {
    PermitableMock public permitable;
    ERC20PermitMock public erc20Permit;
    DaiLikePermitMock public daiLikePermit;
    USDCLikePermitMock public usdcLikePermit;

    uint256 constant PRIVATE_KEY = 0x1234567890123456789012345678901234567890123456789012345678901234;
    address signer;

    function setUp() public {
        permitable = new PermitableMock();
        erc20Permit = new ERC20PermitMock("Test Token", "TEST", address(this), 1000 ether);
        signer = vm.addr(PRIVATE_KEY);
        daiLikePermit = new DaiLikePermitMock("DAI Token", "DAI", signer, 100 ether);
        usdcLikePermit = new USDCLikePermitMock("USDC Token", "USDC", signer, 100e6);

        // Fund signer with tokens
        erc20Permit.transfer(signer, 100 ether);
    }

    function test_ERC20Permit_StandardPermit() public {
        uint256 value = 50 ether;
        uint256 deadline = block.timestamp + 1 hours;

        // Create permit signature
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                erc20Permit.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                        signer,
                        address(permitable),
                        value,
                        erc20Permit.nonces(signer),
                        deadline
                    )
                )
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, permitHash);

        // Full IERC20Permit format (224 bytes)
        bytes memory permitData = abi.encode(signer, address(permitable), value, deadline, v, r, s);

        // Execute permit
        vm.prank(signer);
        permitable.mockPermit(IERC20(address(erc20Permit)), permitData);

        assertEq(erc20Permit.allowance(signer, address(permitable)), value);
    }

    function test_ERC20Permit_CompactPermit() public {
        uint256 value = 30 ether;
        uint256 deadline = block.timestamp + 1 hours;

        // Create permit signature
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                erc20Permit.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                        signer,
                        address(permitable),
                        value,
                        erc20Permit.nonces(signer),
                        deadline
                    )
                )
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, permitHash);

        // Compact IERC20Permit format (100 bytes)
        // value(32) + deadline(4) + r(32) + vs(32) = 100 bytes
        // Note: deadline is incremented by 1 for compact format
        bytes memory permitData = abi.encodePacked(
            value,
            uint32(deadline + 1),
            r,
            bytes32(uint256(s) | (uint256(v - 27) << 255))
        );

        // Execute permit using compact version
        vm.prank(signer);
        permitable.mockPermitCompact(IERC20(address(erc20Permit)), permitData);

        assertEq(erc20Permit.allowance(signer, address(permitable)), value);
    }

    function test_DaiLikePermit() public {
        uint256 deadline = block.timestamp + 1 hours;

        // Create DAI-like permit signature
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                daiLikePermit.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        daiLikePermit.PERMIT_TYPEHASH(),
                        signer,
                        address(permitable),
                        daiLikePermit.nonces(signer),
                        deadline,
                        true
                    )
                )
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, permitHash);

        // Full IDaiLikePermit format (256 bytes)
        bytes memory permitData = abi.encode(signer, address(permitable), daiLikePermit.nonces(signer), deadline, true, v, r, s);

        // Execute permit
        vm.prank(signer);
        permitable.mockPermit(IERC20(address(daiLikePermit)), permitData);

        assertEq(daiLikePermit.allowance(signer, address(permitable)), type(uint128).max);
    }

    function test_DaiLikePermit_Compact() public {
        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = daiLikePermit.nonces(signer);

        // Create DAI-like permit signature
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                daiLikePermit.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        daiLikePermit.PERMIT_TYPEHASH(),
                        signer,
                        address(permitable),
                        nonce,
                        deadline,
                        true
                    )
                )
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, permitHash);

        // Compact IDaiLikePermit format (72 bytes)
        // nonce(4) + expiry(4) + r(32) + vs(32) = 72 bytes
        // Note: expiry is incremented by 1 for compact format
        bytes memory permitData = abi.encodePacked(
            uint32(nonce),
            uint32(deadline + 1),
            r,
            bytes32(uint256(s) | (uint256(v - 27) << 255))
        );

        // Execute permit using compact version
        vm.prank(signer);
        permitable.mockPermitCompact(IERC20(address(daiLikePermit)), permitData);

        assertEq(daiLikePermit.allowance(signer, address(permitable)), type(uint128).max);
    }

    function test_USDCLikePermit() public {
        uint256 value = 50e6; // 50 USDC
        uint256 deadline = block.timestamp + 1 hours;

        // USDC uses IERC7597Permit (dynamic length signature)
        bytes32 permitHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                usdcLikePermit.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        usdcLikePermit.PERMIT_TYPEHASH(),
                        signer,
                        address(permitable),
                        value,
                        usdcLikePermit.nonces(signer),
                        deadline
                    )
                )
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, permitHash);

        // For USDC-like permits (IERC7597Permit), we need the full permit data
        // Format: owner(32) + spender(32) + value(32) + deadline(32) + signature
        bytes memory permitData = abi.encode(
            signer,
            address(permitable),
            value,
            deadline,
            abi.encodePacked(r, s, v)
        );

        vm.prank(signer);
        permitable.mockPermit(IERC20(address(usdcLikePermit)), permitData);

        assertEq(usdcLikePermit.allowance(signer, address(permitable)), value);
    }

    function test_InvalidPermitLength_Reverts() public {
        // Test with invalid permit length
        bytes memory invalidPermit = new bytes(50);

        vm.prank(signer);
        vm.expectRevert();
        permitable.mockPermit(IERC20(address(erc20Permit)), invalidPermit);
    }
}
