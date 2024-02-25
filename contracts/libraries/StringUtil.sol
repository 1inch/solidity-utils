// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title StringUtil
 * @dev Library with gas-efficient string operations.
 */
library StringUtil {
    /**
     * @notice Converts a uint256 value to its hexadecimal string representation.
     * @param value The uint256 value to convert.
     * @return The hexadecimal string representation of the input value.
     */
    function toHex(uint256 value) internal pure returns (string memory) {
        return toHex(abi.encodePacked(value));
    }

    /**
     * @notice Converts an address to its hexadecimal string representation.
     * @param value The address to convert.
     * @return The hexadecimal string representation of the input address.
     */
    function toHex(address value) internal pure returns (string memory) {
        return toHex(abi.encodePacked(value));
    }

    /**
     * @dev Converts arbitrary bytes to their hexadecimal string representation.
     * This is an assembly adaptation of highly optimized toHex16 code by Mikhail Vladimirov.
     * Reference: https://stackoverflow.com/a/69266989
     * @param data The bytes to be converted to hexadecimal string.
     * @return result The hexadecimal string representation of the input bytes.
     */
    function toHex(bytes memory data) internal pure returns (string memory result) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            function _toHex16(input) -> output {
                output := or(
                    and(input, 0xFFFFFFFFFFFFFFFF000000000000000000000000000000000000000000000000),
                    shr(64, and(input, 0x0000000000000000FFFFFFFFFFFFFFFF00000000000000000000000000000000))
                )
                output := or(
                    and(output, 0xFFFFFFFF000000000000000000000000FFFFFFFF000000000000000000000000),
                    shr(32, and(output, 0x00000000FFFFFFFF000000000000000000000000FFFFFFFF0000000000000000))
                )
                output := or(
                    and(output, 0xFFFF000000000000FFFF000000000000FFFF000000000000FFFF000000000000),
                    shr(16, and(output, 0x0000FFFF000000000000FFFF000000000000FFFF000000000000FFFF00000000))
                )
                output := or(
                    and(output, 0xFF000000FF000000FF000000FF000000FF000000FF000000FF000000FF000000),
                    shr(8, and(output, 0x00FF000000FF000000FF000000FF000000FF000000FF000000FF000000FF0000))
                )
                output := or(
                    shr(4, and(output, 0xF000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000)),
                    shr(8, and(output, 0x0F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F00))
                )
                output := add(
                    add(0x3030303030303030303030303030303030303030303030303030303030303030, output),
                    mul(
                        and(
                            shr(4, add(output, 0x0606060606060606060606060606060606060606060606060606060606060606)),
                            0x0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F
                        ),
                        7 // Change 7 to 39 for lower case output
                    )
                )
            }

            result := mload(0x40)
            let length := mload(data)
            let resultLength := shl(1, length)
            let toPtr := add(result, 0x22) // 32 bytes for length + 2 bytes for '0x'
            mstore(0x40, add(toPtr, resultLength)) // move free memory pointer
            mstore(add(result, 2), 0x3078) // 0x3078 is right aligned so we write to `result + 2`
            // to store the last 2 bytes in the beginning of the string
            mstore(result, add(resultLength, 2)) // extra 2 bytes for '0x'

            for {
                let fromPtr := add(data, 0x20)
                let endPtr := add(fromPtr, length)
            } lt(fromPtr, endPtr) {
                fromPtr := add(fromPtr, 0x20)
            } {
                let rawData := mload(fromPtr)
                let hexData := _toHex16(rawData)
                mstore(toPtr, hexData)
                toPtr := add(toPtr, 0x20)
                hexData := _toHex16(shl(128, rawData))
                mstore(toPtr, hexData)
                toPtr := add(toPtr, 0x20)
            }
        }
    }
}
