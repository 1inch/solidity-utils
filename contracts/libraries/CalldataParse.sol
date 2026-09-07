// SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

/**
 * @notice Intermediary type existing between `at()` and `as<T>()`.
 * Not intended for direct use.
 * @dev Eliminates need of `using CalldataParse for bytes32` in each file.
 */
type CalldataWord is bytes32;
using CalldataParse for CalldataWord global;

/**
 * @title CalldataParse
 * @notice Library for efficient packed values parsing from calldata byte arrays.
 * Warning: Does not perform array bounds checking for gas efficiency.
 * @dev Resolve function (`as<T>()`) extracts left-aligned packed bytes as value of type `T`.
 * @dev Parsing examples: `calls.at(0).asU16()`, `calls.at(2).asAddress()`, `calls.at(22).asBool(0)`.
 */
library CalldataParse {
    /**
     * @notice Loads a 32-byte word from calldata byte array at a byte offset.
     * @param calls Calldata bytes to read from.
     * @param shift Byte offset in `calls` array.
     * @return res Loaded word.
     */
    function at(bytes calldata calls, uint256 shift) internal pure returns (CalldataWord res) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            res := calldataload(add(calls.offset, shift))
        }
    }

    /**
     * @notice Reads a bit from a calldata word.
     * @param word Word to read from.
     * @param bit Zero-based bit position, counted from the most-significant (left) bit.
     * @return Whether the specified bit is set.
     */
    function asBool(CalldataWord word, uint8 bit) internal pure returns (bool) {
        return (CalldataWord.unwrap(word) << bit) & 0x8000000000000000000000000000000000000000000000000000000000000000 != 0;
    }

    function asAddress(CalldataWord word) internal pure returns (address) { return address(bytes20(CalldataWord.unwrap(word))); }

    function asU8(CalldataWord word) internal pure returns (uint8) { return uint8(bytes1(CalldataWord.unwrap(word))); }
    function asU16(CalldataWord word) internal pure returns (uint16) { return uint16(bytes2(CalldataWord.unwrap(word))); }
    function asU24(CalldataWord word) internal pure returns (uint24) { return uint24(bytes3(CalldataWord.unwrap(word))); }
    function asU32(CalldataWord word) internal pure returns (uint32) { return uint32(bytes4(CalldataWord.unwrap(word))); }
    function asU40(CalldataWord word) internal pure returns (uint40) { return uint40(bytes5(CalldataWord.unwrap(word))); }
    function asU48(CalldataWord word) internal pure returns (uint48) { return uint48(bytes6(CalldataWord.unwrap(word))); }
    function asU56(CalldataWord word) internal pure returns (uint56) { return uint56(bytes7(CalldataWord.unwrap(word))); }
    function asU64(CalldataWord word) internal pure returns (uint64) { return uint64(bytes8(CalldataWord.unwrap(word))); }
    function asU72(CalldataWord word) internal pure returns (uint72) { return uint72(bytes9(CalldataWord.unwrap(word))); }
    function asU80(CalldataWord word) internal pure returns (uint80) { return uint80(bytes10(CalldataWord.unwrap(word))); }
    function asU88(CalldataWord word) internal pure returns (uint88) { return uint88(bytes11(CalldataWord.unwrap(word))); }
    function asU96(CalldataWord word) internal pure returns (uint96) { return uint96(bytes12(CalldataWord.unwrap(word))); }
    function asU104(CalldataWord word) internal pure returns (uint104) { return uint104(bytes13(CalldataWord.unwrap(word))); }
    function asU112(CalldataWord word) internal pure returns (uint112) { return uint112(bytes14(CalldataWord.unwrap(word))); }
    function asU120(CalldataWord word) internal pure returns (uint120) { return uint120(bytes15(CalldataWord.unwrap(word))); }
    function asU128(CalldataWord word) internal pure returns (uint128) { return uint128(bytes16(CalldataWord.unwrap(word))); }
    function asU136(CalldataWord word) internal pure returns (uint136) { return uint136(bytes17(CalldataWord.unwrap(word))); }
    function asU144(CalldataWord word) internal pure returns (uint144) { return uint144(bytes18(CalldataWord.unwrap(word))); }
    function asU152(CalldataWord word) internal pure returns (uint152) { return uint152(bytes19(CalldataWord.unwrap(word))); }
    function asU160(CalldataWord word) internal pure returns (uint160) { return uint160(bytes20(CalldataWord.unwrap(word))); }
    function asU168(CalldataWord word) internal pure returns (uint168) { return uint168(bytes21(CalldataWord.unwrap(word))); }
    function asU176(CalldataWord word) internal pure returns (uint176) { return uint176(bytes22(CalldataWord.unwrap(word))); }
    function asU184(CalldataWord word) internal pure returns (uint184) { return uint184(bytes23(CalldataWord.unwrap(word))); }
    function asU192(CalldataWord word) internal pure returns (uint192) { return uint192(bytes24(CalldataWord.unwrap(word))); }
    function asU200(CalldataWord word) internal pure returns (uint200) { return uint200(bytes25(CalldataWord.unwrap(word))); }
    function asU208(CalldataWord word) internal pure returns (uint208) { return uint208(bytes26(CalldataWord.unwrap(word))); }
    function asU216(CalldataWord word) internal pure returns (uint216) { return uint216(bytes27(CalldataWord.unwrap(word))); }
    function asU224(CalldataWord word) internal pure returns (uint224) { return uint224(bytes28(CalldataWord.unwrap(word))); }
    function asU232(CalldataWord word) internal pure returns (uint232) { return uint232(bytes29(CalldataWord.unwrap(word))); }
    function asU240(CalldataWord word) internal pure returns (uint240) { return uint240(bytes30(CalldataWord.unwrap(word))); }
    function asU248(CalldataWord word) internal pure returns (uint248) { return uint248(bytes31(CalldataWord.unwrap(word))); }
    function asU256(CalldataWord word) internal pure returns (uint256) { return uint256(bytes32(CalldataWord.unwrap(word))); }

    function asBytes1(CalldataWord word) internal pure returns (bytes1) { return bytes1(CalldataWord.unwrap(word)); }
    function asBytes2(CalldataWord word) internal pure returns (bytes2) { return bytes2(CalldataWord.unwrap(word)); }
    function asBytes3(CalldataWord word) internal pure returns (bytes3) { return bytes3(CalldataWord.unwrap(word)); }
    function asBytes4(CalldataWord word) internal pure returns (bytes4) { return bytes4(CalldataWord.unwrap(word)); }
    function asBytes5(CalldataWord word) internal pure returns (bytes5) { return bytes5(CalldataWord.unwrap(word)); }
    function asBytes6(CalldataWord word) internal pure returns (bytes6) { return bytes6(CalldataWord.unwrap(word)); }
    function asBytes7(CalldataWord word) internal pure returns (bytes7) { return bytes7(CalldataWord.unwrap(word)); }
    function asBytes8(CalldataWord word) internal pure returns (bytes8) { return bytes8(CalldataWord.unwrap(word)); }
    function asBytes9(CalldataWord word) internal pure returns (bytes9) { return bytes9(CalldataWord.unwrap(word)); }
    function asBytes10(CalldataWord word) internal pure returns (bytes10) { return bytes10(CalldataWord.unwrap(word)); }
    function asBytes11(CalldataWord word) internal pure returns (bytes11) { return bytes11(CalldataWord.unwrap(word)); }
    function asBytes12(CalldataWord word) internal pure returns (bytes12) { return bytes12(CalldataWord.unwrap(word)); }
    function asBytes13(CalldataWord word) internal pure returns (bytes13) { return bytes13(CalldataWord.unwrap(word)); }
    function asBytes14(CalldataWord word) internal pure returns (bytes14) { return bytes14(CalldataWord.unwrap(word)); }
    function asBytes15(CalldataWord word) internal pure returns (bytes15) { return bytes15(CalldataWord.unwrap(word)); }
    function asBytes16(CalldataWord word) internal pure returns (bytes16) { return bytes16(CalldataWord.unwrap(word)); }
    function asBytes17(CalldataWord word) internal pure returns (bytes17) { return bytes17(CalldataWord.unwrap(word)); }
    function asBytes18(CalldataWord word) internal pure returns (bytes18) { return bytes18(CalldataWord.unwrap(word)); }
    function asBytes19(CalldataWord word) internal pure returns (bytes19) { return bytes19(CalldataWord.unwrap(word)); }
    function asBytes20(CalldataWord word) internal pure returns (bytes20) { return bytes20(CalldataWord.unwrap(word)); }
    function asBytes21(CalldataWord word) internal pure returns (bytes21) { return bytes21(CalldataWord.unwrap(word)); }
    function asBytes22(CalldataWord word) internal pure returns (bytes22) { return bytes22(CalldataWord.unwrap(word)); }
    function asBytes23(CalldataWord word) internal pure returns (bytes23) { return bytes23(CalldataWord.unwrap(word)); }
    function asBytes24(CalldataWord word) internal pure returns (bytes24) { return bytes24(CalldataWord.unwrap(word)); }
    function asBytes25(CalldataWord word) internal pure returns (bytes25) { return bytes25(CalldataWord.unwrap(word)); }
    function asBytes26(CalldataWord word) internal pure returns (bytes26) { return bytes26(CalldataWord.unwrap(word)); }
    function asBytes27(CalldataWord word) internal pure returns (bytes27) { return bytes27(CalldataWord.unwrap(word)); }
    function asBytes28(CalldataWord word) internal pure returns (bytes28) { return bytes28(CalldataWord.unwrap(word)); }
    function asBytes29(CalldataWord word) internal pure returns (bytes29) { return bytes29(CalldataWord.unwrap(word)); }
    function asBytes30(CalldataWord word) internal pure returns (bytes30) { return bytes30(CalldataWord.unwrap(word)); }
    function asBytes31(CalldataWord word) internal pure returns (bytes31) { return bytes31(CalldataWord.unwrap(word)); }
    function asBytes32(CalldataWord word) internal pure returns (bytes32) { return bytes32(CalldataWord.unwrap(word)); }
}
