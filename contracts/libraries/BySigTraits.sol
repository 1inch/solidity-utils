// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title BySigTraits
 * @notice Provides utility functions for decoding and working with `BySig` call traits encoded in a single `uint256` value.
 * @dev This library allows for the compact representation and manipulation of various call traits such as nonce type,
 * deadline, relayer allowance, and nonce value using bit manipulation techniques.
 */
library BySigTraits {
    /// @notice Thrown when an invalid nonce type is encountered.
    error WrongNonceType();

    /**
     * @dev Represents the encoded traits of a call, packed within a single `uint256`.
     * The encoding is as follows:
     * [255-254] -   2 bits - Nonce type (e.g., Account, Selector, Unique).
     * [253-248] -   6 bits - Reserved for future use.
     * [247-208] -  40 bits - Deadline (Unix timestamp at which the call becomes invalid).
     * [207-128] -  80 bits - Relayer address's lower bits. A value of 0 indicates that any relayer is allowed.
     * [127-0]   - 128 bits - Nonce value (used for ensuring calls are executed in order and not replayed).
     */
    type Value is uint256;

    enum NonceType {
        Account,
        Selector,
        Unique
    }

    uint256 constant internal TYPE_BIT_SHIFT = 254;
    uint256 constant internal DEADLINE_BIT_SHIFT = 208;
    uint256 constant internal DEADLINE_BIT_MASK = (1 << 40) - 1;
    uint256 constant internal RELAYER_BIT_SHIFT = 128;
    uint256 constant internal RELAYER_BIT_MASK = (1 << 80) - 1;
    uint256 constant internal NONCE_MASK = (1 << 128) - 1;

    /**
     * @notice Decodes and returns the nonce type from the traits.
     * @param traits The encoded call traits.
     * @return The decoded nonce type as an enum.
     */
    function nonceType(Value traits) internal pure returns(NonceType) {
        uint256 _type = Value.unwrap(traits) >> TYPE_BIT_SHIFT;
        if (_type > uint256(NonceType.Unique)) revert WrongNonceType();
        return NonceType(_type);
    }

    /**
     * @notice Decodes and returns the deadline from the traits.
     * @param traits The encoded call traits.
     * @return The decoded deadline timestamp.
     */
    function deadline(Value traits) internal pure returns(uint256) {
        return (Value.unwrap(traits) >> DEADLINE_BIT_SHIFT) & DEADLINE_BIT_MASK;
    }

    /**
     * @notice Checks if a given relayer address is allowed to relay the call based on the traits.
     * @param traits The encoded call traits.
     * @param relayer The address of the relayer to check.
     * @return True if the relayer is allowed, false otherwise.
     */
    function isRelayerAllowed(Value traits, address relayer) internal pure returns(bool) {
        uint256 relayerBits = (Value.unwrap(traits) >> RELAYER_BIT_SHIFT) & RELAYER_BIT_MASK;
        return relayerBits == 0 || (uint160(relayer) & RELAYER_BIT_MASK) == relayerBits;
    }

    /**
     * @notice Decodes and returns the nonce value from the traits.
     * @param traits The encoded call traits.
     * @return The decoded nonce value.
     */
    function nonce(Value traits) internal pure returns(uint256) {
        return Value.unwrap(traits) & NONCE_MASK;
    }
}
