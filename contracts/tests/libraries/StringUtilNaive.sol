// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library StringUtilNaive {
    bytes16 private constant _ALPHABET = 0x30313233343536373839414243444546;

    function toHex(uint256 value) internal pure returns (string memory) {
        return toHex(abi.encodePacked(value));
    }

    function toHex(bytes memory data) internal pure returns (string memory) {
        unchecked {
            bytes memory str = new bytes(2 + data.length * 2);
            str[0] = "0";
            str[1] = "x";
            for (uint256 i = 0; i < data.length; i++) {
                str[2 * i + 2] = _ALPHABET[uint8(data[i] >> 4)];
                str[2 * i + 3] = _ALPHABET[uint8(data[i] & 0x0f)];
            }
            return string(str);
        }
    }
}
