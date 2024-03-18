// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC1271 } from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import { ERC20, ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract USDCLikePermitMock is ERC20Permit {
    // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)")
    bytes32
        public constant PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;

    error InvalidSignature();
    error PermitExpired();

    constructor(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialBalance
    ) payable ERC20(name, symbol) ERC20Permit(name){
        _mint(initialAccount, initialBalance);
    }

    /**
     * @notice Update allowance with a signed permit
     * @dev EOA wallet signatures should be packed in the order of r, s, v.
     * @param owner       Token owner's address (Authorizer)
     * @param spender     Spender's address
     * @param value       Amount of allowance
     * @param deadline    The time at which the signature expires (unix time), or max uint256 value to signal no expiration
     * @param signature   Signature bytes signed by an EOA wallet or a contract wallet
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        bytes memory signature
    ) external {
        if (deadline != type(uint256).max && deadline < block.timestamp) {
            revert PermitExpired();
        }

        bytes32 typedDataHash = _toTypedDataHash(
            _domainSeparatorV4(),
            keccak256(
                abi.encode(
                    PERMIT_TYPEHASH,
                    owner,
                    spender,
                    value,
                    _useNonce(owner),
                    deadline
                )
            )
        );
        if (!_isValidERC1271SignatureNow(owner, typedDataHash, signature)) {
            revert InvalidSignature();
        }
        _approve(owner, spender, value);
    }

    /**
     * @dev Returns the keccak256 digest of an EIP-712 typed data (EIP-191 version `0x01`).
     * Adapted from https://github.com/OpenZeppelin/openzeppelin-contracts/blob/21bb89ef5bfc789b9333eb05e3ba2b7b284ac77c/contracts/utils/cryptography/MessageHashUtils.sol
     *
     * The digest is calculated from a `domainSeparator` and a `structHash`, by prefixing them with
     * `\x19\x01` and hashing the result. It corresponds to the hash signed by the
     * https://eips.ethereum.org/EIPS/eip-712[`eth_signTypedData`] JSON-RPC method as part of EIP-712.
     *
     * @param domainSeparator    Domain separator
     * @param structHash         Hashed EIP-712 data struct
     * @return digest            The keccak256 digest of an EIP-712 typed data
     */
    function _toTypedDataHash(bytes32 domainSeparator, bytes32 structHash)
        internal
        pure
        returns (bytes32 digest)
    {
        assembly { // solhint-disable-line no-inline-assembly
            let ptr := mload(0x40)
            mstore(ptr, "\x19\x01")
            mstore(add(ptr, 0x02), domainSeparator)
            mstore(add(ptr, 0x22), structHash)
            digest := keccak256(ptr, 0x42)
        }
    }

    function _isValidERC1271SignatureNow(
        address signer,
        bytes32 digest,
        bytes memory signature
    ) internal view returns (bool) {
        (bool success, bytes memory result) = signer.staticcall(
            abi.encodeWithSelector(
                IERC1271.isValidSignature.selector,
                digest,
                signature
            )
        );
        return (success &&
            result.length >= 32 &&
            abi.decode(result, (bytes32)) ==
            bytes32(IERC1271.isValidSignature.selector));
    }
}
