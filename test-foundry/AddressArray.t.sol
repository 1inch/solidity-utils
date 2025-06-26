// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/mocks/AddressArrayMock.sol";
import "../contracts/libraries/AddressArray.sol";

contract AddressArrayTest is TestHelpers {
    AddressArrayMock public addressArrayMock;
    address[] public addresses;

    function setUp() public {
        addressArrayMock = new AddressArrayMock();

        addresses.push(address(0x1));
        addresses.push(address(0x2));
        addresses.push(address(0x3));
    }

    function test_Length_ReturnsCorrectLength() public {
        assertEq(addressArrayMock.length(), 0);

        addressArrayMock.push(addresses[0]);
        assertEq(addressArrayMock.length(), 1);

        addressArrayMock.push(addresses[1]);
        assertEq(addressArrayMock.length(), 2);
    }

    function test_At_ReturnsCorrectAddress() public {
        for (uint256 i = 0; i < addresses.length; i++) {
            addressArrayMock.push(addresses[i]);
        }

        for (uint256 i = 0; i < addresses.length; i++) {
            assertEq(addressArrayMock.at(i), addresses[i]);
        }
    }

    function test_At_RevertsOnOutOfBounds() public {
        vm.expectRevert(AddressArray.IndexOutOfBounds.selector);
        addressArrayMock.at(0);

        addressArrayMock.push(addresses[0]);
        vm.expectRevert(AddressArray.IndexOutOfBounds.selector);
        addressArrayMock.at(1);
    }

    function test_Get_ReturnsAddressArray() public {
        for (uint256 i = 0; i < addresses.length; i++) {
            addressArrayMock.push(addresses[i]);
        }

        address[] memory result = addressArrayMock.get();
        assertEq(result.length, addresses.length);

        for (uint256 i = 0; i < addresses.length; i++) {
            assertEq(result[i], addresses[i]);
        }
    }

    function test_GetAndProvideArr_ReturnsArrays() public {
        for (uint256 i = 0; i < addresses.length; i++) {
            addressArrayMock.push(addresses[i]);
        }

        // Provide array must be large enough to hold all addresses
        address[] memory providedArr = new address[](3);
        (address[] memory result, address[] memory returnedProvidedArr) = addressArrayMock.getAndProvideArr(providedArr);

        assertEq(result.length, 3);
        assertEq(result[0], addresses[0]);
        assertEq(result[1], addresses[1]);
        assertEq(result[2], addresses[2]);

        assertEq(returnedProvidedArr.length, 3);
        // Check that the contents match
        assertEq(returnedProvidedArr[0], addresses[0]);
        assertEq(returnedProvidedArr[1], addresses[1]);
        assertEq(returnedProvidedArr[2], addresses[2]);
    }

    function test_GetAndProvideArr_RevertsIfTooSmall() public {
        for (uint256 i = 0; i < addresses.length; i++) {
            addressArrayMock.push(addresses[i]);
        }

        // Provide array that's too small
        address[] memory providedArr = new address[](2);
        vm.expectRevert(AddressArray.OutputArrayTooSmall.selector);
        addressArrayMock.getAndProvideArr(providedArr);
    }

    function test_Push_AddsAddress() public {
        addressArrayMock.push(addresses[0]);
        assertEq(addressArrayMock.length(), 1);
        assertEq(addressArrayMock.at(0), addresses[0]);
    }

    function test_Pop_RemovesLastAddress() public {
        for (uint256 i = 0; i < addresses.length; i++) {
            addressArrayMock.push(addresses[i]);
        }

        addressArrayMock.pop();
        assertEq(addressArrayMock.length(), 2);

        address[] memory remaining = addressArrayMock.get();
        assertEq(remaining[0], addresses[0]);
        assertEq(remaining[1], addresses[1]);
    }

    function test_Set_UpdatesAddress() public {
        for (uint256 i = 0; i < addresses.length; i++) {
            addressArrayMock.push(addresses[i]);
        }

        address newAddress = address(0x999);
        addressArrayMock.set(1, newAddress);
        assertEq(addressArrayMock.at(1), newAddress);
    }
}
