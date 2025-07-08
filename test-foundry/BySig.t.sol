// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/mocks/TokenWithBySig.sol";
import "../contracts/tests/mocks/ERC1271WalletMock.sol";
import "../contracts/libraries/ECDSA.sol";
import "../contracts/libraries/BySigTraits.sol";

contract BySigTest is TestHelpers {
    TokenWithBySig public token;
    ERC1271WalletMock public wallet;

    uint256 constant PRIVATE_KEY = 0x1234567890123456789012345678901234567890123456789012345678901234;
    address signer;

    function setUp() public {
        token = new TokenWithBySig("Test Token", "TEST", "1");
        wallet = new ERC1271WalletMock(address(this));
        signer = vm.addr(PRIVATE_KEY);

        // Mint tokens to the contract
        token.mint(address(this), 1000 ether);
    }

    function test_BySigNonces() public {
        // Test account nonce
        assertEq(token.bySigAccountNonces(signer), 0);

        // Test selector nonce
        assertEq(token.bySigSelectorNonces(signer, bytes4(keccak256("transfer(address,uint256)"))), 0);

        // Test unique nonce
        assertFalse(token.bySigUniqueNonces(signer, 1));
    }

    function test_BySig_ValidSignature() public {
        // First mint tokens to the signer, not the test contract
        token.mint(signer, 1000 ether);

        uint256 amount = 100;
        uint256 deadline = block.timestamp + 1 hours;

        // Create traits for account nonce type
        BySigTraits.Value traits = BySigTraits.Value.wrap(
            (uint256(BySigTraits.NonceType.Account) << 254) | // nonce type
            (deadline << 208) | // deadline
            0 // nonce value
        );

        // Create signed call
        bytes memory data = abi.encodeWithSelector(token.transfer.selector, address(0x5678), amount);
        BySig.SignedCall memory signedCall = BySig.SignedCall({
            traits: traits,
            data: data
        });

        // Hash and sign
        bytes32 hash = token.hashBySig(signedCall);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, hash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Execute
        uint256 balanceBefore = token.balanceOf(address(0x5678));
        vm.prank(address(0x9999)); // Relayer
        token.bySig(signer, signedCall, signature);
        uint256 balanceAfter = token.balanceOf(address(0x5678));

        assertEq(balanceAfter - balanceBefore, amount);
        assertEq(token.bySigAccountNonces(signer), 1);
    }

    function test_BySig_RevertsExpiredSignature() public {
        uint256 amount = 100;
        uint256 deadline = block.timestamp - 1; // Expired

        // Create traits
        BySigTraits.Value traits = BySigTraits.Value.wrap(
            (uint256(BySigTraits.NonceType.Account) << 254) |
            (deadline << 208) |
            0
        );

        // Create signed call
        bytes memory data = abi.encodeWithSelector(token.transfer.selector, address(0x5678), amount);
        BySig.SignedCall memory signedCall = BySig.SignedCall({
            traits: traits,
            data: data
        });

        // Hash and sign
        bytes32 hash = token.hashBySig(signedCall);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, hash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Should revert
        vm.expectRevert(BySig.DeadlineExceeded.selector);
        token.bySig(signer, signedCall, signature);
    }

    function test_BySig_RevertsInvalidSignature() public {
        uint256 amount = 100;
        uint256 deadline = block.timestamp + 1 hours;

        // Create traits
        BySigTraits.Value traits = BySigTraits.Value.wrap(
            (uint256(BySigTraits.NonceType.Account) << 254) |
            (deadline << 208) |
            0
        );

        // Create signed call
        bytes memory data = abi.encodeWithSelector(token.transfer.selector, address(0x5678), amount);
        BySig.SignedCall memory signedCall = BySig.SignedCall({
            traits: traits,
            data: data
        });

        // Invalid signature
        bytes memory signature = hex"deadbeef";

        // Should revert
        vm.expectRevert(BySig.WrongSignature.selector);
        token.bySig(signer, signedCall, signature);
    }

    function test_BySig_WorksWithERC1271() public {
        // Create a new wallet owned by signer
        ERC1271WalletMock signerWallet = new ERC1271WalletMock(signer);

        // First mint tokens to the wallet address
        token.mint(address(signerWallet), 1000 ether);

        uint256 amount = 100;
        uint256 deadline = block.timestamp + 1 hours;

        // Create traits
        BySigTraits.Value traits = BySigTraits.Value.wrap(
            (uint256(BySigTraits.NonceType.Account) << 254) |
            (deadline << 208) |
            0
        );

        // Create signed call
        bytes memory data = abi.encodeWithSelector(token.transfer.selector, address(0x5678), amount);
        BySig.SignedCall memory signedCall = BySig.SignedCall({
            traits: traits,
            data: data
        });

        // Hash for ERC1271
        bytes32 hash = token.hashBySig(signedCall);

        // The wallet expects a signature from its owner (signer)
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, hash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Execute with wallet as signer (wallet will validate the signature)
        uint256 balanceBefore = token.balanceOf(address(0x5678));
        token.bySig(address(signerWallet), signedCall, signature);
        uint256 balanceAfter = token.balanceOf(address(0x5678));

        assertEq(balanceAfter - balanceBefore, amount);
    }

    function test_BySig_SelectorNonce() public {
        // First give signer some balance
        token.transfer(signer, 200);

        uint256 amount = 50;
        uint256 deadline = block.timestamp + 1 hours;

        // Create traits with selector nonce type
        BySigTraits.Value traits = BySigTraits.Value.wrap(
            (uint256(BySigTraits.NonceType.Selector) << 254) |
            (deadline << 208) |
            0 // First nonce for this selector
        );

        // Create signed call
        bytes memory data = abi.encodeWithSelector(token.transfer.selector, address(0x5678), amount);
        BySig.SignedCall memory signedCall = BySig.SignedCall({
            traits: traits,
            data: data
        });

        // Hash and sign
        bytes32 hash = token.hashBySig(signedCall);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, hash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Execute
        uint256 balanceBefore = token.balanceOf(address(0x5678));
        token.bySig(signer, signedCall, signature);
        uint256 balanceAfter = token.balanceOf(address(0x5678));

        assertEq(balanceAfter - balanceBefore, amount);
        assertEq(token.bySigSelectorNonces(signer, token.transfer.selector), 1);
    }
}
