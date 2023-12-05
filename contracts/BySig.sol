// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "./libraries/ECDSA.sol";

abstract contract BySig is Context, EIP712 {
    using Address for address;

    error WrongNonce();
    error WrongRelayer();
    error WrongSignature();

    struct SignedCall {
        address relayer;
        uint256 nonce;
        bytes data;
    }

    bytes32 constant public SIGNED_CALL_TYPEHASH = keccak256("SignedCall(address relayer,uint256 nonce,bytes data)");

    address[] /* transient */ private _msgSenders;
    mapping(address => uint256) public bySigNonces;
    mapping(address => mapping(bytes4 => uint256)) public bySigSelectorNonces;

    function _msgSender() internal view override returns (address) {
        return _msgSenders[_msgSenders.length - 1];
    }

    function hashBySig(SignedCall calldata sig) public view returns(bytes32) {
        return _hashTypedDataV4(
            keccak256(abi.encode(
                SIGNED_CALL_TYPEHASH,
                sig.relayer,
                sig.nonce,
                keccak256(sig.data)
            ))
        );
    }

    function bySig(address signer, SignedCall calldata sig, bytes calldata signature) external payable returns(bytes memory ret) {
        if (sig.relayer != address(0) && sig.relayer != _msgSender()) revert WrongRelayer();
        if (!_useNonce(signer, sig.nonce, sig.data)) revert WrongNonce();
        if (!ECDSA.recoverOrIsValidSignature(signer, hashBySig(sig), signature)) revert WrongSignature();

        _msgSenders.push(signer);
        ret = address(this).functionDelegateCall(sig.data);
        _msgSenders.pop();
    }

    function useBySigNonce(uint32 advance) external {
        bySigNonces[_msgSender()] += advance;
    }

    function useBySigSelectorNonce(bytes4 selector, uint32 advance) external {
        bySigSelectorNonces[_msgSender()][selector] += advance;
    }

    function _useNonce(address signer, uint256 nonce, bytes calldata data) private returns(bool) {
        if (nonce >> 255 == 0) {
            return nonce == bySigNonces[signer]++;
        } else {
            return ((nonce << 1) >> 1) == bySigSelectorNonces[signer][bytes4(data)]++;
        }
    }
}
