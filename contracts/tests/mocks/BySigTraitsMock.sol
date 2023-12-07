// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../libraries/BySigTraits.sol";

contract BySigTraitsMock {
    using BySigTraits for BySigTraits.Value;

    function nonceType(BySigTraits.Value traits) external pure returns(BySigTraits.NonceType) {
        return traits.nonceType();
    }

    function deadline(BySigTraits.Value traits) external pure returns(uint256) {
        return traits.deadline();
    }

    function isRelayerAllowed(BySigTraits.Value traits, address relayer) external pure returns(bool) {
        return traits.isRelayerAllowed(relayer);
    }

    function nonce(BySigTraits.Value traits) external pure returns(uint256) {
        return traits.nonce();
    }
}
