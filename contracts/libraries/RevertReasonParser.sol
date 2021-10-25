// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

/** @title Library that allows to parse unsuccessful arbitrary calls revert reasons.
  * See https://solidity.readthedocs.io/en/latest/control-structures.html#revert for details.
  * Note that we assume revert reason being abi-encoded as Error(string) so it may fail to parse reason
  * if structured reverts appear in the future.
  *
  * All unsuccessful parsings get encoded as Unknown(data) string
  */
library RevertReasonParser {
    bytes4 constant private _ERROR_SELECTOR = bytes4(keccak256("Error(string)"));
    bytes4 constant private _PANIC_SELECTOR = bytes4(keccak256("Panic(uint256)"));

    function parse(bytes memory data, string memory prefix) internal pure returns (string memory) {
        // https://solidity.readthedocs.io/en/latest/control-structures.html#revert
        // We assume that revert reason is abi-encoded as Error(string)
        bytes4 selector;
        assembly {  // solhint-disable-line no-inline-assembly
            selector := mload(add(data, 0x20))
        }

        // 68 = 4-byte selector + 32 bytes offset + 32 bytes length
        if (selector == _ERROR_SELECTOR && data.length >= 68) {
            string memory reason;
            // solhint-disable no-inline-assembly
            assembly {
                // 68 = 32 bytes data length + 4-byte selector + 32 bytes offset
                reason := add(data, 68)
            }
            /*
                revert reason is padded up to 32 bytes with ABI encoder: Error(string)
                also sometimes there is extra 32 bytes of zeros padded in the end:
                https://github.com/ethereum/solidity/issues/10170
                because of that we can't check for equality and instead check
                that string length + extra 68 bytes is less than overall data length
            */
            require(data.length >= 68 + bytes(reason).length, "Invalid revert reason");
            return string(abi.encodePacked(prefix, "Error(", reason, ")"));
        }
        // 36 = 4-byte selector + 32 bytes integer
        else if (selector == _PANIC_SELECTOR && data.length == 36) {
            uint256 code;
            // solhint-disable no-inline-assembly
            assembly {
                // 36 = 32 bytes data length + 4-byte selector
                code := mload(add(data, 36))
            }
            return string(abi.encodePacked(prefix, "Panic(", _toHex(code), ")"));
        }
        return string(abi.encodePacked(prefix, "Unknown(", _toHex(data), ")"));
    }

    function _toHex(uint256 value) private pure returns (string memory) {
        return _toHex(abi.encodePacked(value));
    }

    function _toHex16(bytes16 data) private pure returns (bytes32 result) {
        result = bytes32(data) & 0xFFFFFFFFFFFFFFFF000000000000000000000000000000000000000000000000 |
              (bytes32(data) & 0x0000000000000000FFFFFFFFFFFFFFFF00000000000000000000000000000000) >> 64;
        result = result & 0xFFFFFFFF000000000000000000000000FFFFFFFF000000000000000000000000 |
              (result & 0x00000000FFFFFFFF000000000000000000000000FFFFFFFF0000000000000000) >> 32;
        result = result & 0xFFFF000000000000FFFF000000000000FFFF000000000000FFFF000000000000 |
              (result & 0x0000FFFF000000000000FFFF000000000000FFFF000000000000FFFF00000000) >> 16;
        result = result & 0xFF000000FF000000FF000000FF000000FF000000FF000000FF000000FF000000 |
              (result & 0x00FF000000FF000000FF000000FF000000FF000000FF000000FF000000FF0000) >> 8;
        result = (result & 0xF000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000) >> 4 |
              (result & 0x0F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F00) >> 8;
        result = bytes32(0x3030303030303030303030303030303030303030303030303030303030303030 +
               uint256(result) +
               (uint256(result) + 0x0606060606060606060606060606060606060606060606060606060606060606 >> 4 &
               0x0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F) * 7); // Change 7 to 39 for lower case output
    }

    function _toHex(bytes memory data) private pure returns (string memory) {
        uint length = data.length;
        string memory result = new string(length << 1); // Ignore overflow here
        uint fromPtr;
        uint endPtr;
        uint toPtr;
        assembly {
            fromPtr := add(data, 0x20)
            endPtr := add(fromPtr, length)
            toPtr := add(result, 0x20)
        }
        while (fromPtr < endPtr) {
            bytes16 rawData;
            assembly {
                rawData := mload(fromPtr)
            }
            bytes32 hexData = _toHex16(rawData);
            assembly {
                mstore(toPtr, hexData) // May write beyond the array into unallocated memory
            }
            fromPtr += 16;
            toPtr += 32;
        }
        return string(abi.encodePacked("0x", result));
    }
}