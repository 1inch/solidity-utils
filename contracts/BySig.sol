// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "./libraries/ECDSA.sol";
import { BySigTraits } from "./libraries/BySigTraits.sol";
import { AddressArray } from "./libraries/AddressArray.sol";

abstract contract BySig is Context, EIP712 {
    using Address for address;
    using BySigTraits for BySigTraits.Value;
    using AddressArray for AddressArray.Data;

    error WrongNonce();
    error WrongRelayer();
    error WrongSignature();
    error DeadlineExceeded();

    struct SignedCall {
        BySigTraits.Value traits;
        bytes data;
    }

    bytes32 constant public SIGNED_CALL_TYPEHASH = keccak256("SignedCall(uint256 traits,bytes data)");

    AddressArray.Data /* transient */ private _msgSenders;
    mapping(address => uint256) private _bySigAccountNonces;
    mapping(address => mapping(bytes4 => uint256)) private _bySigSelectorNonces;
    mapping(address => mapping(uint256 => uint256)) private _bySigUniqueNonces;

    function bySigAccountNonces(address account) external view returns(uint256) {
        return _bySigAccountNonces[account];
    }

    function bySigSelectorNonces(address account, bytes4 selector) external view returns(uint256) {
        return _bySigSelectorNonces[account][selector];
    }

    function bySigUniqueNonces(address account, uint256 nonce) external view returns(bool) {
        return (_bySigUniqueNonces[account][nonce >> 8] & (1 << (nonce & 0xff))) != 0;
    }

    function bySigUniqueNoncesSlot(address account, uint256 nonce) external view returns(uint256) {
        return _bySigUniqueNonces[account][nonce >> 8];
    }

    function hashBySig(SignedCall calldata sig) public view returns(bytes32) {
        return _hashTypedDataV4(
            keccak256(abi.encode(
                SIGNED_CALL_TYPEHASH,
                sig.traits,
                keccak256(sig.data)
            ))
        );
    }

    function bySig(address signer, SignedCall calldata sig, bytes calldata signature) public payable returns(bytes memory ret) {
        if (block.timestamp > sig.traits.deadline()) revert DeadlineExceeded(); // solhint-disable-line not-rely-on-time
        // Using _msgSender() in the next line allows private relay execution redelegation
        if (!sig.traits.isRelayerAllowed(_msgSender())) revert WrongRelayer();
        if (!_useNonce(signer, sig.traits, sig.data)) revert WrongNonce();
        if (!ECDSA.recoverOrIsValidSignature(signer, hashBySig(sig), signature)) revert WrongSignature();

        _msgSenders.push(signer);
        ret = address(this).functionDelegateCall(sig.data);
        _msgSenders.pop();
    }

    function sponsoredCall(address token, uint256 amount, bytes calldata data) external payable returns(bytes memory ret) {
        ret = address(this).functionDelegateCall(data);
        _chargeSigner(_msgSender(), msg.sender, token, amount);
    }

    // Override this method to implement sponsored call accounting
    // Example imeplementation:
    //
    // function _chargeSigner(address signer, address relayer, address token, uint256 amount) internal override {
    //     balances[token][signer] -= amount;
    //     balances[token][relayer] += amount;
    // }
    //
    function _chargeSigner(address signer, address relayer, address token, uint256 amount) internal virtual;


    function useBySigAccountNonce(uint32 advance) external {
        _bySigAccountNonces[_msgSender()] += advance;
    }

    function useBySigSelectorNonce(bytes4 selector, uint32 advance) external {
        _bySigSelectorNonces[_msgSender()][selector] += advance;
    }

    function useBySigUniqueNonce(uint256 nonce) external {
        _bySigUniqueNonces[_msgSender()][nonce >> 8] |= 1 << (nonce & 0xff);
    }

    function _msgSender() internal view override virtual returns (address) {
        uint256 length = _msgSenders.length();
        if (length == 0) {
            return super._msgSender();
        }
        return _msgSenders.at(length - 1);
    }

    function _useNonce(address signer, BySigTraits.Value traits, bytes calldata data) private returns(bool) {
        BySigTraits.NonceType nonceType = traits.nonceType();
        uint256 nonce = traits.nonce();
        if (nonceType == BySigTraits.NonceType.Account) {
            return nonce == _bySigAccountNonces[signer]++;
        }
        if (nonceType == BySigTraits.NonceType.Selector) {
            return nonce == _bySigSelectorNonces[signer][bytes4(data)]++;
        }
        if (nonceType == BySigTraits.NonceType.Unique) {
            mapping(uint256 => uint256) storage map = _bySigUniqueNonces[signer];
            uint256 cache = map[nonce >> 8];
            map[nonce >> 8] |= 1 << (nonce & 0xff);
            return cache != map[nonce >> 8];
        }
        return false;
    }
}
