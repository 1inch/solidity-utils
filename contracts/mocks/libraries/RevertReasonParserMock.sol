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
contract RevertReasonParserMock {
    bytes4 constant private _ERROR_SELECTOR = bytes4(keccak256("Error(string)"));
    bytes4 constant private _PANIC_SELECTOR = bytes4(keccak256("Panic(uint256)"));

    function parse(bytes memory data, string memory prefix) public pure returns (string memory) {
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

    // solhint-disable private-vars-leading-underscore
    function _toHex(uint256 value) public pure returns (string memory) {
        return _toHex(abi.encodePacked(value));
    }

    // solhint-disable private-vars-leading-underscore
    function _toHex16(bytes16 data) public pure returns (bytes32 result) {
        result = bytes32(data) & 0xffffffffffffffff000000000000000000000000000000000000000000000000 |
              (bytes32(data) & 0x0000000000000000ffffffffffffffff00000000000000000000000000000000) >> 64;
        result = result & 0xffffffff000000000000000000000000ffffffff000000000000000000000000 |
              (result & 0x00000000ffffffff000000000000000000000000ffffffff0000000000000000) >> 32;
        result = result & 0xffff000000000000ffff000000000000ffff000000000000ffff000000000000 |
              (result & 0x0000ffff000000000000ffff000000000000ffff000000000000ffff00000000) >> 16;
        result = result & 0xff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000 |
              (result & 0x00ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff0000) >> 8;
        result = (result & 0xf000f000f000f000f000f000f000f000f000f000f000f000f000f000f000f000) >> 4 |
              (result & 0x0f000f000f000f000f000f000f000f000f000f000f000f000f000f000f000f00) >> 8;
        result = bytes32(0x3030303030303030303030303030303030303030303030303030303030303030 +
               uint256(result) +
               (uint256(result) + 0x0606060606060606060606060606060606060606060606060606060606060606 >> 4 &
               0x0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f) * 7); // Change 7 to 39 for lower case output
    }

    // solhint-disable private-vars-leading-underscore
    function _toHex(bytes memory data) public pure returns (string memory) {
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

    // solhint-disable private-vars-leading-underscore
    function _toHexEfficiencyTest(bytes memory data) public payable returns (string memory) {
        return _toHex(data);
    } 
}