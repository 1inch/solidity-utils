// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/mocks/BySigTraitsMock.sol";
import "../contracts/libraries/BySigTraits.sol";

contract BySigTraitsTest is TestHelpers {
    BySigTraitsMock public bySigTraitsMock;

    function setUp() public {
        bySigTraitsMock = new BySigTraitsMock();
    }

    function test_NonceType() public {
        // Test account nonce type
        BySigTraits.Value traits = BySigTraits.Value.wrap(
            (uint256(BySigTraits.NonceType.Account) << 254)
        );
        assertEq(uint256(bySigTraitsMock.nonceType(traits)), uint256(BySigTraits.NonceType.Account));

        // Test selector nonce type
        traits = BySigTraits.Value.wrap(
            (uint256(BySigTraits.NonceType.Selector) << 254)
        );
        assertEq(uint256(bySigTraitsMock.nonceType(traits)), uint256(BySigTraits.NonceType.Selector));

        // Test unique nonce type
        traits = BySigTraits.Value.wrap(
            (uint256(BySigTraits.NonceType.Unique) << 254)
        );
        assertEq(uint256(bySigTraitsMock.nonceType(traits)), uint256(BySigTraits.NonceType.Unique));
    }

    function test_Deadline() public {
        uint256 deadline = 1234567890;
        BySigTraits.Value traits = BySigTraits.Value.wrap(
            (deadline << 208)
        );
        assertEq(bySigTraitsMock.deadline(traits), deadline);
    }

    function test_Nonce() public {
        uint256 nonce = 0x12345678901234567890123456789012; // 128-bit value
        BySigTraits.Value traits = BySigTraits.Value.wrap(nonce);
        assertEq(bySigTraitsMock.nonce(traits), nonce);
    }

    function test_IsRelayerAllowed() public {
        // Test with no specific relayer (0 means any relayer)
        BySigTraits.Value traits = BySigTraits.Value.wrap(0);
        assertTrue(bySigTraitsMock.isRelayerAllowed(traits, address(0x1234)));
        assertTrue(bySigTraitsMock.isRelayerAllowed(traits, address(0x5678)));

        // Test with specific relayer bits
        address relayer = address(0x1234567890123456789012345678901234567890);
        uint256 relayerBits = uint160(relayer) & ((1 << 80) - 1);
        traits = BySigTraits.Value.wrap(relayerBits << 128);

        assertTrue(bySigTraitsMock.isRelayerAllowed(traits, relayer));
        // Different address with same lower 80 bits should also be allowed
        address relayer2 = address(uint160((uint160(0xFFFFFFFFFFFFFFFFFFFFFF) << 80) | relayerBits));
        assertTrue(bySigTraitsMock.isRelayerAllowed(traits, relayer2));

        // Different lower bits should not be allowed
        assertFalse(bySigTraitsMock.isRelayerAllowed(traits, address(0x9999)));
    }

    function test_CombinedTraits() public {
        uint256 nonceType = uint256(BySigTraits.NonceType.Selector);
        uint256 deadline = 0xFFFFFFFFFF; // max 40-bit value
        uint256 relayerBits = 0xFFFFFFFFFFFFFFFFFFFF; // max 80-bit value
        uint256 nonce = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF; // max 128-bit value

        BySigTraits.Value traits = BySigTraits.Value.wrap(
            (nonceType << 254) |
            (deadline << 208) |
            (relayerBits << 128) |
            nonce
        );

        assertEq(uint256(bySigTraitsMock.nonceType(traits)), nonceType);
        assertEq(bySigTraitsMock.deadline(traits), deadline);
        assertEq(bySigTraitsMock.nonce(traits), nonce);

        // Check relayer with matching lower bits
        address testRelayer = address(uint160((uint160(0x111111111111111111111111) << 80) | relayerBits));
        assertTrue(bySigTraitsMock.isRelayerAllowed(traits, testRelayer));
    }

    function test_WrongNonceType() public {
        // Test invalid nonce type (greater than Unique)
        BySigTraits.Value traits = BySigTraits.Value.wrap(
            (uint256(3) << 254) // Invalid nonce type
        );

        vm.expectRevert(BySigTraits.WrongNonceType.selector);
        bySigTraitsMock.nonceType(traits);
    }

    function test_EdgeCases() public {
        // Test zero traits
        BySigTraits.Value traits = BySigTraits.Value.wrap(0);
        assertEq(uint256(bySigTraitsMock.nonceType(traits)), uint256(BySigTraits.NonceType.Account));
        assertEq(bySigTraitsMock.deadline(traits), 0);
        assertEq(bySigTraitsMock.nonce(traits), 0);
        assertTrue(bySigTraitsMock.isRelayerAllowed(traits, address(0)));

        // Test max values
        traits = BySigTraits.Value.wrap(type(uint256).max);
        assertEq(bySigTraitsMock.deadline(traits), (1 << 40) - 1);
        assertEq(bySigTraitsMock.nonce(traits), (1 << 128) - 1);
    }
}
