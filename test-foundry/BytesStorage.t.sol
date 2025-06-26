// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/mocks/BytesStorageMock.sol";
import "../contracts/libraries/BytesStorage.sol";

contract BytesStorageTest is TestHelpers {
    BytesStorageMock public bytesStorage;

    function setUp() public {
        bytesStorage = new BytesStorageMock();
    }

    function test_Wrap_CreatesSlice() public {
        bytes memory testData = hex"1234567890abcdef";
        bytesStorage.setData(testData);

        BytesStorage.Slice memory slice = bytesStorage.wrap();
        assertEq(slice.length, testData.length);
    }

    function test_WrapAndCopy_ReturnsData() public {
        bytes memory testData = hex"1234567890abcdef";
        bytesStorage.setData(testData);

        bytes memory result = bytesStorage.wrapAndCopy();
        assertEq(result, testData);
    }

    function test_WrapAndSlice_ExtractsPortion() public {
        bytes memory testData = "Hello, World!";
        bytesStorage.setData(testData);

        uint256 offset = 7;
        uint256 size = 5;
        BytesStorage.Slice memory slice = bytesStorage.wrapAndSlice(offset, size);
        assertEq(slice.length, size);
    }

    function test_WrapWithSliceAndCopy_ExtractsAndCopies() public {
        bytes memory testData = "Hello, World!";
        bytesStorage.setData(testData);

        uint256 offset = 7;
        uint256 size = 5;
        bytes memory result = bytesStorage.wrapWithSliceAndCopy(offset, size);
        assertEq(result.length, size);
        assertEq(string(result), "World");
    }

    function test_EmptyBytes() public {
        bytes memory empty = "";
        bytesStorage.setData(empty);

        bytes memory result = bytesStorage.wrapAndCopy();
        assertEq(result.length, 0);
        assertEq(result, empty);
    }

    function test_LargeData() public {
        bytes memory largeData = new bytes(1000);
        for (uint256 i = 0; i < largeData.length; i++) {
            largeData[i] = bytes1(uint8(i % 256));
        }
        bytesStorage.setData(largeData);

        bytes memory result = bytesStorage.wrapAndCopy();
        assertEq(result.length, largeData.length);
        assertEq(result, largeData);
    }

    function test_SliceOutOfBounds_Reverts() public {
        bytes memory testData = "short";
        bytesStorage.setData(testData);

        // Try to slice beyond the data length
        vm.expectRevert();
        bytesStorage.wrapAndSlice(10, 5);
    }

    function test_MultipleSlices() public {
        bytes memory testData = "0123456789ABCDEF";
        bytesStorage.setData(testData);

        // First slice
        bytes memory slice1 = bytesStorage.wrapWithSliceAndCopy(0, 4);
        assertEq(string(slice1), "0123");

        // Second slice
        bytes memory slice2 = bytesStorage.wrapWithSliceAndCopy(4, 4);
        assertEq(string(slice2), "4567");

        // Third slice
        bytes memory slice3 = bytesStorage.wrapWithSliceAndCopy(8, 8);
        assertEq(string(slice3), "89ABCDEF");
    }
}
