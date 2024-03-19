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

    uint256 constant private _TYPE_BIT_SHIFT = 254;
    uint256 constant private _DEADLINE_BIT_SHIFT = 208;
    uint256 constant private _DEADLINE_BIT_MASK = (1 << 40) - 1;
    uint256 constant private _RELAYER_BIT_SHIFT = 128;
    uint256 constant private _RELAYER_BIT_MASK = (1 << 80) - 1;
    uint256 constant private _NONCE_MASK = (1 << 128) - 1;

    function nonceType(Value traits) internal pure returns(NonceType) {
        uint256 _type = Value.unwrap(traits) >> _TYPE_BIT_SHIFT;
        if (_type > uint256(NonceType.Unique)) revert WrongNonceType();
        return NonceType(_type);
    }

    function deadline(Value traits) internal pure returns(uint256) {
        return (Value.unwrap(traits) >> _DEADLINE_BIT_SHIFT) & _DEADLINE_BIT_MASK;
    }

    function isRelayerAllowed(Value traits, address relayer) internal pure returns(bool) {
        uint256 lowerBits = (Value.unwrap(traits) >> _RELAYER_BIT_SHIFT) & _RELAYER_BIT_MASK;
        return lowerBits == 0 || (uint160(relayer) & _RELAYER_BIT_MASK) == lowerBits;
    }

    function nonce(Value traits) internal pure returns(uint256) {
        return Value.unwrap(traits) & _NONCE_MASK;
    }
}
