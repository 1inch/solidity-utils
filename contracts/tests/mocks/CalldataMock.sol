// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../../libraries/Calldata.sol";

contract CalldataMock {
    error TestError();

    function sliceWithBounds(bytes calldata data, uint256 begin, uint256 end) external pure returns (bytes calldata) {
        return Calldata.slice(data, begin, end);
    }

    function sliceWithBoundsChecked(bytes calldata data, uint256 begin, uint256 end) external pure returns (bytes calldata) {
        return Calldata.slice(data, begin, end, TestError.selector);
    }

    function sliceToEnd(bytes calldata data, uint256 begin) external pure returns (bytes calldata) {
        return Calldata.slice(data, begin);
    }

    function sliceToEndChecked(bytes calldata data, uint256 begin) external pure returns (bytes calldata) {
        return Calldata.slice(data, begin, TestError.selector);
    }
}
