// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library BySigTraits {
    error WrongNonceType();

    // 8 bits for type (2 highest bits actually)
    // 40 bits for deadline
    // 80 bits for relayer address lower bits
    // 128 bits for nonce value
    type Value is uint256;

    enum NonceType {
        Account,
        Selector,
        Unique
    }

    uint256 constant public DEADLINE_BIT_SHIFT = 208;
    uint256 constant public DEADLINE_BIT_MASK = (1 << 40) - 1;
    uint256 constant public RELAYER_BIT_SHIFT = 128;
    uint256 constant public RELAYER_BIT_MASK = (1 << 80) - 1;
    uint256 constant public NONCE_MASK = (1 << 128) - 1;

    function nonceType(Value traits) internal pure returns(NonceType) {
        uint256 bits = Value.unwrap(traits) >> 254;
        if (bits > uint256(NonceType.Unique)) revert WrongNonceType();
        return NonceType(bits);
    }

    function deadline(Value traits) internal pure returns(uint256) {
        return (Value.unwrap(traits) >> DEADLINE_BIT_SHIFT) & DEADLINE_BIT_MASK;
    }

    function isRelayerAllowed(Value traits, address relayer) internal pure returns(bool) {
        uint256 lowerBits = (Value.unwrap(traits) >> RELAYER_BIT_SHIFT) & RELAYER_BIT_MASK;
        return lowerBits == 0 || (uint160(relayer) & RELAYER_BIT_MASK) == lowerBits;
    }

    function nonce(Value traits) internal pure returns(uint256) {
        return Value.unwrap(traits) & NONCE_MASK;
    }
}
