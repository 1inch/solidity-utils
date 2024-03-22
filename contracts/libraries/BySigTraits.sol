// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library BySigTraits {
    error WrongNonceType();

    // 2 bits for type
    // 6 bits reserved for future use
    // 40 bits for deadline
    // 80 bits for relayer address lower bits
    // 128 bits for nonce value
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

    function nonceType(Value traits) internal pure returns(NonceType) {
        uint256 _type = Value.unwrap(traits) >> TYPE_BIT_SHIFT;
        if (_type > uint256(NonceType.Unique)) revert WrongNonceType();
        return NonceType(_type);
    }

    function deadline(Value traits) internal pure returns(uint256) {
        return (Value.unwrap(traits) >> DEADLINE_BIT_SHIFT) & DEADLINE_BIT_MASK;
    }

    function isRelayerAllowed(Value traits, address relayer) internal pure returns(bool) {
        uint256 relayerBits = (Value.unwrap(traits) >> RELAYER_BIT_SHIFT) & RELAYER_BIT_MASK;
        return relayerBits == 0 || (uint160(relayer) & RELAYER_BIT_MASK) == relayerBits;
    }

    function nonce(Value traits) internal pure returns(uint256) {
        return Value.unwrap(traits) & NONCE_MASK;
    }
}
