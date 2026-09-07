// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../../libraries/CalldataParse.sol";

contract CalldataParseMock {
    using CalldataParse for bytes;

    error InvalidSize();

    function asBool(bytes calldata data, uint256 shift, uint8 bit) external pure returns (bool) {
        return data.at(shift).asBool(bit);
    }

    function asAddress(bytes calldata data, uint256 shift) external pure returns (address) {
        return data.at(shift).asAddress();
    }

    function asUintN(bytes calldata data, uint256 shift, uint256 n) external pure returns (uint256) {
        CalldataWord word = data.at(shift);
        if (n == 8) return word.asU8();
        if (n == 16) return word.asU16();
        if (n == 24) return word.asU24();
        if (n == 32) return word.asU32();
        if (n == 40) return word.asU40();
        if (n == 48) return word.asU48();
        if (n == 56) return word.asU56();
        if (n == 64) return word.asU64();
        if (n == 72) return word.asU72();
        if (n == 80) return word.asU80();
        if (n == 88) return word.asU88();
        if (n == 96) return word.asU96();
        if (n == 104) return word.asU104();
        if (n == 112) return word.asU112();
        if (n == 120) return word.asU120();
        if (n == 128) return word.asU128();
        if (n == 136) return word.asU136();
        if (n == 144) return word.asU144();
        if (n == 152) return word.asU152();
        if (n == 160) return word.asU160();
        if (n == 168) return word.asU168();
        if (n == 176) return word.asU176();
        if (n == 184) return word.asU184();
        if (n == 192) return word.asU192();
        if (n == 200) return word.asU200();
        if (n == 208) return word.asU208();
        if (n == 216) return word.asU216();
        if (n == 224) return word.asU224();
        if (n == 232) return word.asU232();
        if (n == 240) return word.asU240();
        if (n == 248) return word.asU248();
        if (n == 256) return word.asU256();
        revert InvalidSize();
    }

    function asBytesN(bytes calldata data, uint256 shift, uint256 n) external pure returns (bytes32) {
        CalldataWord word = data.at(shift);
        if (n == 1) return word.asBytes1();
        if (n == 2) return word.asBytes2();
        if (n == 3) return word.asBytes3();
        if (n == 4) return word.asBytes4();
        if (n == 5) return word.asBytes5();
        if (n == 6) return word.asBytes6();
        if (n == 7) return word.asBytes7();
        if (n == 8) return word.asBytes8();
        if (n == 9) return word.asBytes9();
        if (n == 10) return word.asBytes10();
        if (n == 11) return word.asBytes11();
        if (n == 12) return word.asBytes12();
        if (n == 13) return word.asBytes13();
        if (n == 14) return word.asBytes14();
        if (n == 15) return word.asBytes15();
        if (n == 16) return word.asBytes16();
        if (n == 17) return word.asBytes17();
        if (n == 18) return word.asBytes18();
        if (n == 19) return word.asBytes19();
        if (n == 20) return word.asBytes20();
        if (n == 21) return word.asBytes21();
        if (n == 22) return word.asBytes22();
        if (n == 23) return word.asBytes23();
        if (n == 24) return word.asBytes24();
        if (n == 25) return word.asBytes25();
        if (n == 26) return word.asBytes26();
        if (n == 27) return word.asBytes27();
        if (n == 28) return word.asBytes28();
        if (n == 29) return word.asBytes29();
        if (n == 30) return word.asBytes30();
        if (n == 31) return word.asBytes31();
        if (n == 32) return word.asBytes32();
        revert InvalidSize();
    }
}
