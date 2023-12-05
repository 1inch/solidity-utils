// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "./libraries/ECDSA.sol";

abstract contract BySig is Context, EIP712 {
    using Address for address;

    error WrongNonce();
    error WrongSignature();

    address[] /* transient */ private _msgSenders;
    mapping(address => uint256) public bySigNonces;
    mapping(address => mapping(bytes4 => uint256)) public bySigSelectorNonces;

    bytes32 constant private _BYSIG_TYPEHASH = keccak256("BySig(uint256 nonce,bytes data)");

    function _msgSender() internal view override returns (address) {
        return _msgSenders[_msgSenders.length - 1];
    }

    function hashBySig(uint256 nonce, bytes calldata data) public view returns(bytes32) {
        return _hashTypedDataV4(
            keccak256(abi.encodePacked(
                _BYSIG_TYPEHASH,
                nonce,
                keccak256(data)
            ))
        );
    }

    function bySig(address signer, uint256 nonce, bytes calldata data, bytes calldata signature) external payable returns(bytes memory ret) {
        if (!_useNonce(signer, nonce, data)) revert WrongNonce();
        if (!ECDSA.recoverOrIsValidSignature(signer, hashBySig(nonce, data), signature)) revert WrongSignature();

        _msgSenders.push(signer);
        ret = address(this).functionDelegateCall(data);
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
