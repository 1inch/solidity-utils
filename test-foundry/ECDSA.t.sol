// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/ECDSATest.sol";
import "../contracts/tests/mocks/ERC1271WalletMock.sol";

contract ECDSATestContract is TestHelpers {
    ECDSATest public ecdsaTest;

    uint256 constant PRIVATE_KEY = 0x1234567890123456789012345678901234567890123456789012345678901234;
    address signer;
    bytes32 TEST_MESSAGE = keccak256("Test Message");

    function setUp() public {
        ecdsaTest = new ECDSATest();
        signer = vm.addr(PRIVATE_KEY);
    }

    function test_Recover_v_r_s_ValidSignature() public {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);

        address recovered = ecdsaTest.recover_v_r_s(TEST_MESSAGE, v, r, s);
        assertEq(recovered, signer);
    }

    function test_Recover_v_r_s_InvalidSignature() public {
        address recovered = ecdsaTest.recover_v_r_s(TEST_MESSAGE, 27, bytes32(0), bytes32(0));
        assertEq(recovered, address(0));
    }

    function test_Recover_ValidSignatureBytes() public {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);
        bytes memory signature = abi.encodePacked(r, s, v);

        address recovered = ecdsaTest.recover(TEST_MESSAGE, signature);
        assertEq(recovered, signer);
    }

    function test_Recover_InvalidSignatureBytes() public {
        bytes memory invalidSig = new bytes(65);
        address recovered = ecdsaTest.recover(TEST_MESSAGE, invalidSig);
        assertEq(recovered, address(0));
    }

    function test_Recover_ShortSignature() public {
        bytes memory shortSig = new bytes(64);
        address recovered = ecdsaTest.recover(TEST_MESSAGE, shortSig);
        assertEq(recovered, address(0));
    }

    function test_RecoverOrIsValidSignature_ValidEOASignature() public {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);
        bytes memory signature = abi.encodePacked(r, s, v);

        bool isValid = ecdsaTest.recoverOrIsValidSignature(signer, TEST_MESSAGE, signature);
        assertTrue(isValid);
    }

    function test_RecoverOrIsValidSignature_InvalidEOASignature() public {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Wrong signer
        bool isValid = ecdsaTest.recoverOrIsValidSignature(address(0x1234), TEST_MESSAGE, signature);
        assertFalse(isValid);
    }

    function test_RecoverOrIsValidSignature_v_r_s() public {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);

        bool isValid = ecdsaTest.recoverOrIsValidSignature_v_r_s(signer, TEST_MESSAGE, v, r, s);
        assertTrue(isValid);
    }

    function test_IsValidSignature_ValidSignature() public {
        // isValidSignature only works with contract wallets, not EOAs
        ERC1271WalletMock wallet = new ERC1271WalletMock(signer);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);
        bytes memory signature = abi.encodePacked(r, s, v);

        bool isValid = ecdsaTest.isValidSignature(address(wallet), TEST_MESSAGE, signature);
        assertTrue(isValid);
    }

    function test_IsValidSignature_v_r_s() public {
        // isValidSignature only works with contract wallets, not EOAs
        ERC1271WalletMock wallet = new ERC1271WalletMock(signer);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);

        bool isValid = ecdsaTest.isValidSignature_v_r_s(address(wallet), TEST_MESSAGE, v, r, s);
        assertTrue(isValid);
    }

    function test_ToEthSignedMessageHash() public {
        bytes32 hash = keccak256("test");
        bytes32 ethHash = ecdsaTest.toEthSignedMessageHash(hash);

        // Verify it matches the expected format
        bytes32 expected = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        assertEq(ethHash, expected);
    }

    function test_ToTypedDataHash() public {
        bytes32 domainSeparator = keccak256("DOMAIN");
        bytes32 structHash = keccak256("STRUCT");

        bytes32 typedHash = ecdsaTest.toTypedDataHash(domainSeparator, structHash);

        // Verify it matches EIP-712 format
        bytes32 expected = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        assertEq(typedHash, expected);
    }

    function test_Recover_r_vs() public {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);

        // Convert to vs format (v in the highest bit of s)
        bytes32 vs = bytes32(uint256(s) | (uint256(v - 27) << 255));

        address recovered = ecdsaTest.recover_r_vs(TEST_MESSAGE, r, vs);
        assertEq(recovered, signer);
    }

    function test_RecoverOrIsValidSignature_r_vs() public {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);

        // Convert to vs format
        bytes32 vs = bytes32(uint256(s) | (uint256(v - 27) << 255));

        bool isValid = ecdsaTest.recoverOrIsValidSignature_r_vs(signer, TEST_MESSAGE, r, vs);
        assertTrue(isValid);
    }

    function test_IsValidSignature_r_vs() public {
        // isValidSignature only works with contract wallets, not EOAs
        ERC1271WalletMock wallet = new ERC1271WalletMock(signer);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);

        // Convert to vs format
        bytes32 vs = bytes32(uint256(s) | (uint256(v - 27) << 255));

        bool isValid = ecdsaTest.isValidSignature_r_vs(address(wallet), TEST_MESSAGE, r, vs);
        assertTrue(isValid);
    }

    function test_RecoverOrIsValidSignature65() public {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);

        // Convert to vs format
        bytes32 vs = bytes32(uint256(s) | (uint256(v - 27) << 255));

        bool isValid = ecdsaTest.recoverOrIsValidSignature65(signer, TEST_MESSAGE, r, vs);
        assertTrue(isValid);
    }

    function test_IsValidSignature65() public {
        // isValidSignature only works with contract wallets, not EOAs
        ERC1271WalletMock wallet = new ERC1271WalletMock(signer);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);

        // Convert to vs format
        bytes32 vs = bytes32(uint256(s) | (uint256(v - 27) << 255));

        bool isValid = ecdsaTest.isValidSignature65(address(wallet), TEST_MESSAGE, r, vs);
        assertTrue(isValid);
    }

    // ERC1271 Contract Wallet Tests
    function test_RecoverOrIsValidSignature_ContractWallet() public {
        ERC1271WalletMock wallet = new ERC1271WalletMock(signer);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);
        bytes memory signature = abi.encodePacked(r, s, v);

        bool isValid = ecdsaTest.recoverOrIsValidSignature(address(wallet), TEST_MESSAGE, signature);
        assertTrue(isValid);
    }

    function test_RecoverOrIsValidSignature_ContractWallet_InvalidSignature() public {
        ERC1271WalletMock wallet = new ERC1271WalletMock(signer);

        // Sign with different private key
        uint256 wrongKey = 0xdead;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongKey, TEST_MESSAGE);
        bytes memory signature = abi.encodePacked(r, s, v);

        bool isValid = ecdsaTest.recoverOrIsValidSignature(address(wallet), TEST_MESSAGE, signature);
        assertFalse(isValid);
    }

    function test_RecoverOrIsValidSignature_v_r_s_ContractWallet() public {
        ERC1271WalletMock wallet = new ERC1271WalletMock(signer);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);

        bool isValid = ecdsaTest.recoverOrIsValidSignature_v_r_s(address(wallet), TEST_MESSAGE, v, r, s);
        assertTrue(isValid);
    }

    function test_RecoverOrIsValidSignature_r_vs_ContractWallet() public {
        ERC1271WalletMock wallet = new ERC1271WalletMock(signer);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);
        bytes32 vs = bytes32(uint256(s) | (uint256(v - 27) << 255));

        bool isValid = ecdsaTest.recoverOrIsValidSignature_r_vs(address(wallet), TEST_MESSAGE, r, vs);
        assertTrue(isValid);
    }

    function test_RecoverOrIsValidSignature65_ContractWallet() public {
        ERC1271WalletMock wallet = new ERC1271WalletMock(signer);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(PRIVATE_KEY, TEST_MESSAGE);
        bytes32 vs = bytes32(uint256(s) | (uint256(v - 27) << 255));

        bool isValid = ecdsaTest.recoverOrIsValidSignature65(address(wallet), TEST_MESSAGE, r, vs);
        assertTrue(isValid);
    }
}
