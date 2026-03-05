// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../../libraries/CalldataPtr.sol";

contract CalldataPtrMock {
    using CalldataPtrLib for CalldataPtr;

    function from(bytes calldata data) external pure returns (CalldataPtr) {
        return CalldataPtrLib.from(data);
    }

    function toBytes(CalldataPtr ptr) external pure returns (bytes calldata) {
        return ptr.toBytes();
    }

    function roundTrip(bytes calldata data) external pure returns (bytes calldata) {
        CalldataPtr ptr = CalldataPtrLib.from(data);
        return ptr.toBytes();
    }

    function getOffsetAndLength(bytes calldata data) external pure returns (uint128 offset, uint128 length) {
        CalldataPtr ptr = CalldataPtrLib.from(data);
        uint256 raw = CalldataPtr.unwrap(ptr);
        offset = uint128(raw >> 128);
        length = uint128(raw);
    }
}
