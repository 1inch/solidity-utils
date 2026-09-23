// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../libraries/CalldataCut.sol";

contract CalldataCutMock {
    error TestError();

    function sliceWithBounds(bytes calldata data, uint256 begin, uint256 end) external pure returns (bytes calldata) {
        return CalldataCut.slice(data, begin, end);
    }

    function sliceWithBoundsChecked(bytes calldata data, uint256 begin, uint256 end) external pure returns (bytes calldata) {
        return CalldataCut.slice(data, begin, end, TestError.selector);
    }

    function sliceToEnd(bytes calldata data, uint256 begin) external pure returns (bytes calldata) {
        return CalldataCut.slice(data, begin);
    }

    function sliceToEndChecked(bytes calldata data, uint256 begin) external pure returns (bytes calldata) {
        return CalldataCut.slice(data, begin, TestError.selector);
    }

    function trim(bytes calldata data, uint256 length) external pure returns (bytes calldata) {
        return CalldataCut.trim(data, length);
    }

    function trimChecked(bytes calldata data, uint256 length) external pure returns (bytes calldata) {
        return CalldataCut.trim(data, length, TestError.selector);
    }
}
