// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../libraries/BytesStorage.sol";

contract BytesStorageMock {
    using BytesStorage for bytes;
    using BytesStorage for BytesStorage.Slice;

    bytes private _data;

    function setData(bytes memory data) external {
        _data = data;
    }

    function wrap() public view returns (BytesStorage.Slice memory) {
        return _data.wrap();
    }

    function wrapAndSlice(uint256 offset, uint256 size) external view returns (BytesStorage.Slice memory) {
        return _data.wrap().slice(offset, size);
    }

    function wrapAndCopy() external view returns (bytes memory) {
        return _data.wrap().copy();
    }

    function wrapWithSliceAndCopy(uint256 offset, uint256 size) external view returns (bytes memory) {
        return _data.wrap().slice(offset, size).copy();
    }
}
