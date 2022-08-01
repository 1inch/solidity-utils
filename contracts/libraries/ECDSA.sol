// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

import "@openzeppelin/contracts/interfaces/IERC1271.sol";

library ECDSA {
    function recover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal view returns(address signer) {
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            let ptr := mload(0x40)

            mstore(ptr, hash)
            mstore(add(ptr, 0x20), v)
            mstore(add(ptr, 0x40), r)
            mstore(add(ptr, 0x60), s)
            if staticcall(gas(), 0x1, ptr, 0x80, 0, 0x20) {
                signer := mload(0)
            }
        }
    }

    function recover(bytes32 hash, bytes32 r, bytes32 vs) internal view returns(address signer) {
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            let ptr := mload(0x40)

            mstore(ptr, hash)
            mstore(add(ptr, 0x20), add(27, shr(255, vs)))
            mstore(add(ptr, 0x40), r)
            mstore(add(ptr, 0x60), shr(1, shl(1, vs)))
            if staticcall(gas(), 0x1, ptr, 0x80, 0, 0x20) {
                signer := mload(0)
            }
        }
    }

    function recover(bytes32 hash, bytes calldata signature) internal view returns(address signer) {
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            let ptr := mload(0x40)

            // memory[ptr:ptr+0x80] = (hash, v, r, s)
            switch signature.length
            case 65 {
                // memory[ptr+0x20:ptr+0x80] = (v, r, s)
                mstore(add(ptr, 0x20), byte(0, calldataload(add(signature.offset, 0x40))))
                calldatacopy(add(ptr, 0x40), signature.offset, 0x40)
            }
            case 64 {
                // memory[ptr+0x20:ptr+0x80] = (v, r, s)
                let vs := calldataload(add(signature.offset, 0x20))
                mstore(add(ptr, 0x20), add(27, shr(255, vs)))
                calldatacopy(add(ptr, 0x40), signature.offset, 0x20)
                mstore(add(ptr, 0x60), shr(1, shl(1, vs)))
            }
            default {
                ptr := 0
            }

            if ptr {
                if gt(mload(add(ptr, 0x60)), 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
                    ptr := 0
                }

                if ptr {
                    // memory[ptr:ptr+0x20] = (hash)
                    mstore(ptr, hash)

                    if staticcall(gas(), 0x1, ptr, 0x80, 0, 0x20) {
                        signer := mload(0)
                    }
                }
            }
        }
    }

    function recoverOrIsValidSignature(address signer, bytes32 hash, bytes calldata signature) internal view returns(bool success) {
        if ((signature.length == 64 || signature.length == 65) && recover(hash, signature) == signer) {
            return true;
        }
        return isValidSignature(signer, hash, signature);
    }

    function recoverOrIsValidSignature(address signer, bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal view returns(bool success) {
        if (recover(hash, v, r, s) == signer) {
            return true;
        }
        return isValidSignature(signer, hash, v, r, s);
    }

    function recoverOrIsValidSignature(address signer, bytes32 hash, bytes32 r, bytes32 vs) internal view returns(bool success) {
        if (recover(hash, r, vs) == signer) {
            return true;
        }
        return isValidSignature(signer, hash, r, vs);
    }

    function recoverOrIsValidSignature65(address signer, bytes32 hash, bytes32 r, bytes32 vs) internal view returns(bool success) {
        if (recover(hash, r, vs) == signer) {
            return true;
        }
        return isValidSignature65(signer, hash, r, vs);
    }

    function isValidSignature(address signer, bytes32 hash, bytes calldata signature) internal view returns(bool success) {
        // (bool success, bytes memory data) = signer.staticcall(abi.encodeWithSelector(IERC1271.isValidSignature.selector, hash, signature));
        // return success && data.length >= 4 && abi.decode(data, (bytes4)) == IERC1271.isValidSignature.selector;
        bytes4 selector = IERC1271.isValidSignature.selector;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            let ptr := mload(0x40)

            mstore(ptr, selector)
            mstore(add(ptr, 0x04), hash)
            mstore(add(ptr, 0x24), 0x40)
            mstore(add(ptr, 0x44), signature.length)
            calldatacopy(add(ptr, 0x64), signature.offset, signature.length)
            mstore(0, 0)
            if staticcall(gas(), signer, ptr, add(0x64, signature.length), 0, 0x20) {
                success := eq(selector, mload(0))
            }
        }
    }

    function isValidSignature(address signer, bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal view returns(bool success) {
        bytes4 selector = IERC1271.isValidSignature.selector;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            let ptr := mload(0x40)

            mstore(ptr, selector)
            mstore(add(ptr, 0x04), hash)
            mstore(add(ptr, 0x24), 0x40)
            mstore(add(ptr, 0x44), 65)
            mstore(add(ptr, 0x64), r)
            mstore(add(ptr, 0x84), s)
            mstore8(add(ptr, 0xa4), v)
            mstore(0, 0)
            if staticcall(gas(), signer, ptr, 0xa5, 0, 0x20) {
                success := eq(selector, mload(0))
            }
        }
    }

    function isValidSignature(address signer, bytes32 hash, bytes32 r, bytes32 vs) internal view returns(bool success) {
        // (bool success, bytes memory data) = signer.staticcall(abi.encodeWithSelector(IERC1271.isValidSignature.selector, hash, abi.encodePacked(r, vs)));
        // return success && data.length >= 4 && abi.decode(data, (bytes4)) == IERC1271.isValidSignature.selector;
        bytes4 selector = IERC1271.isValidSignature.selector;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            let ptr := mload(0x40)

            mstore(ptr, selector)
            mstore(add(ptr, 0x04), hash)
            mstore(add(ptr, 0x24), 0x40)
            mstore(add(ptr, 0x44), 64)
            mstore(add(ptr, 0x64), r)
            mstore(add(ptr, 0x84), vs)
            mstore(0, 0)
            if staticcall(gas(), signer, ptr, 0xa5, 0, 0x20) {
                success := eq(selector, mload(0))
            }
        }
    }

    function isValidSignature65(address signer, bytes32 hash, bytes32 r, bytes32 vs) internal view returns(bool success) {
        // (bool success, bytes memory data) = signer.staticcall(abi.encodeWithSelector(IERC1271.isValidSignature.selector, hash, abi.encodePacked(r, vs & ~uint256(1 << 255), uint8(vs >> 255))));
        // return success && data.length >= 4 && abi.decode(data, (bytes4)) == IERC1271.isValidSignature.selector;
        bytes4 selector = IERC1271.isValidSignature.selector;
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            let ptr := mload(0x40)

            mstore(ptr, selector)
            mstore(add(ptr, 0x04), hash)
            mstore(add(ptr, 0x24), 0x40)
            mstore(add(ptr, 0x44), 65)
            mstore(add(ptr, 0x64), r)
            mstore(add(ptr, 0x84), shr(1, shl(1, vs)))
            mstore8(add(ptr, 0xa4), add(27, shr(255, vs)))
            mstore(0, 0)
            if staticcall(gas(), signer, ptr, 0xa5, 0, 0x20) {
                success := eq(selector, mload(0))
            }
        }
    }

    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32 res) {
        // 32 is the length in bytes of hash, enforced by the type signature above
        // return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            mstore(0, 0x19457468657265756d205369676e6564204d6573736167653a0a333200000000) // "\x19Ethereum Signed Message:\n32"
            mstore(28, hash)
            res := keccak256(0, 60)
        }
    }

    function toTypedDataHash(bytes32 domainSeparator, bytes32 structHash) internal pure returns (bytes32 res) {
        // return keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        /// @solidity memory-safe-assembly
        assembly { // solhint-disable-line no-inline-assembly
            let ptr := mload(0x40)
            mstore(ptr, 0x1901000000000000000000000000000000000000000000000000000000000000) // "\x19\x01"
            mstore(add(ptr, 0x02), domainSeparator)
            mstore(add(ptr, 0x22), structHash)
            res := keccak256(ptr, 66)
        }
    }
}
