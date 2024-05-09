// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "../libraries/ECDSA.sol";
import { BySigTraits } from "../libraries/BySigTraits.sol";
import { AddressArray } from "../libraries/AddressArray.sol";

/**
 * @title BySig
 * @notice Mixin that provides signature-based accessibility to every external method of the smart contract.
 * @dev Inherit your contract from this mixin and use `_msgSender()` instead of `msg.sender` everywhere.
 */
abstract contract BySig is Context, EIP712 {
    using Address for address;
    using BySigTraits for BySigTraits.Value;
    using AddressArray for AddressArray.Data;

    /// @notice Emitted when the nonce used for a call is incorrect.
    error WrongNonce();
    /// @notice Emitted when a call is made by an unauthorized relayer.
    error WrongRelayer();
    /// @notice Emitted when the signature provided for a call does not match the expected signature.
    error WrongSignature();
    /// @notice Emitted when a call is attempted after the specified deadline has passed.
    error DeadlineExceeded();

    /**
     * @notice Represents a call to be signed and executed.
     * @dev This structure encapsulates all necessary information for executing a signed call,
     * including traits that specify how the call should be authorized and the actual data to be executed.
     * @param traits An instance of `Value` from the `BySigTraits` library, specifying the nonce type,
     * nonce value, deadline, whether a relayer is allowed for this call and another params, see {BySigTraits-Value}.
     * These traits define the authorization strategy and replay protection for the signed call.
     * @param data The encoded function call data to be executed. This should be generated, for instance,
     * using `encodeFunctionData` of the target contract's interface, containing the function signature and arguments.
     * It represents the exact action to be taken, including which function to call of which contract and with what parameters.
     */
    struct SignedCall {
        BySigTraits.Value traits;
        bytes data;
    }

    bytes32 constant public SIGNED_CALL_TYPEHASH = keccak256("SignedCall(uint256 traits,bytes data)");

    // Various nonces used for signature verification and replay protection.
    AddressArray.Data /* transient */ private _msgSenders;
    mapping(address => uint256) private _bySigAccountNonces;
    mapping(address => mapping(bytes4 => uint256)) private _bySigSelectorNonces;
    mapping(address => mapping(uint256 => uint256)) private _bySigUniqueNonces;

    /**
     * @notice Retrieves the account nonce for the specified account.
     * @param account The address of the account.
     * @return The current nonce for the account.
     */
    function bySigAccountNonces(address account) public view returns(uint256) {
        return _bySigAccountNonces[account];
    }

    /**
     * @notice Retrieves the selector nonce for a specific account and selector.
     * @param account The address of the account.
     * @param selector The selector for which the nonce is being retrieved.
     * @return The current nonce for the specified selector and account.
     */
    function bySigSelectorNonces(address account, bytes4 selector) public view returns(uint256) {
        return _bySigSelectorNonces[account][selector];
    }

    /**
     * @notice Checks if a unique nonce has already been used for a given account.
     * @dev This function divides the nonce space into slots to efficiently manage storage.
     * A unique nonce is considered used if its corresponding bit in the storage slot is set.
     * @param account The address of the account for which the nonce is being checked.
     * @param nonce The unique nonce to check. It is divided into slots for storage efficiency.
     * @return bool True if the nonce has been used, false otherwise.
     */
    function bySigUniqueNonces(address account, uint256 nonce) public view returns(bool) {
        return (_bySigUniqueNonces[account][nonce >> 8] & (1 << (nonce & 0xff))) != 0;
    }

    /**
     * @notice Retrieves the storage slot value for a given account and nonce slot.
     * @dev This function allows access to the raw storage slot used to track used nonces, divided into slots for efficiency.
     * Each bit in the returned value represents the used/unused status of a nonce within that slot.
     * @param account The address of the account for which the nonce slot is being retrieved.
     * @param nonce The nonce for which the storage slot is being retrieved. The function calculates the correct slot based on this value.
     * @return uint256 The raw value of the storage slot that tracks the used/unused status of nonces in the specified slot for the given account.
     */
    function bySigUniqueNoncesSlot(address account, uint256 nonce) public view returns(uint256) {
        return _bySigUniqueNonces[account][nonce >> 8];
    }

    /**
     * @notice Hashes a `SignedCall` struct using EIP-712 typed data hashing rules.
     * @param sig The `SignedCall` structure containing the call traits and data.
     * @return The EIP-712 compliant hash of the `SignedCall` struct.
     */
    function hashBySig(SignedCall calldata sig) public view returns(bytes32) {
        return _hashTypedDataV4(
            keccak256(abi.encode(
                SIGNED_CALL_TYPEHASH,
                sig.traits,
                keccak256(sig.data)
            ))
        );
    }

    /**
     * @notice Executes a signature-authorized call on behalf of the signer.
     * @param signer The address of the signer authorizing the call.
     * @param sig The `SignedCall` structure containing the call traits and data.
     * @param signature The signature authorizing the call.
     * @return ret The bytes result of the executed call.
     */
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

    /**
     * @notice Executes a call sponsored by the signer (for instance, by fee), intended to be used,
     * for instance, in conjunction with `bySig`.
     * @dev Facilitates execution of a delegate call where the signer covers the transaction fees.
     * Requires `_chargeSigner` to be overridden to define the fee transfer logic.
     * @param token Address of the token used for sponsored logic (for instance, for fee payment).
     * @param amount amount value used for sponsored logic (for instance, fee amount to be charged to the signer).
     * @param data Encoded function call to execute.
     * @param extraData Additional data for sponsored process in `_chargeSigner` method.
     * @return ret Result of the executed call.
     */
    function sponsoredCall(address token, uint256 amount, bytes calldata data, bytes calldata extraData) public payable returns(bytes memory ret) {
        ret = address(this).functionDelegateCall(data);
        _chargeSigner(_msgSender(), msg.sender, token, amount, extraData);
    }

    /**
     * @dev Placeholder for custom logic to charge the signer for sponsored calls.
     * Override this method to implement sponsored call accounting.
     * Example imeplementation:
     *
     * function _chargeSigner(address signer, address relayer, address token, uint256 amount, bytes calldata extraData) internal override {
     *    balances[token][signer] -= amount;
     *    balances[token][relayer] += amount;
     * }
     *
     * @param signer The address of the signer being charged.
     * @param relayer The address of the relayer facilitating the call.
     * @param token The token address used for charging.
     * @param amount The amount to be charged.
     * @param extraData Additional data for sponsored call accounting and executions.
     */
    function _chargeSigner(address signer, address relayer, address token, uint256 amount, bytes calldata extraData) internal virtual;

    /**
     * @notice Advances the account nonce for the sender by a specified amount.
     * @param advance The amount by which to advance the nonce.
     */
    function useBySigAccountNonce(uint32 advance) public {
        _bySigAccountNonces[_msgSender()] += advance;
    }

    /**
     * @notice Advances the selector nonce for the sender and a specific selector by a specified amount.
     * @param selector The selector for which the nonce is being advanced.
     * @param advance The amount by which to advance the nonce.
     */
    function useBySigSelectorNonce(bytes4 selector, uint32 advance) public {
        _bySigSelectorNonces[_msgSender()][selector] += advance;
    }

    /**
     * @notice Marks a unique nonce as used for the sender.
     * @param nonce The nonce being marked as used.
     */
    function useBySigUniqueNonce(uint256 nonce) public {
        _bySigUniqueNonces[_msgSender()][nonce >> 8] |= 1 << (nonce & 0xff);
    }

    /**
     * @dev Returns the address of the message sender, replacing the traditional `msg.sender` with a potentially signed sender.
     * @return The address of the message sender.
     */
    function _msgSender() internal view override virtual returns (address) {
        uint256 length = _msgSenders.length();
        if (length == 0) {
            return super._msgSender();
        }
        return _msgSenders.unsafeAt(length - 1);
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
