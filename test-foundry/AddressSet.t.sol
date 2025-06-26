// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/mocks/AddressSetMock.sol";

contract AddressSetTest is TestHelpers {
    AddressSetMock public addressSetMock;
    address[] public addresses;

    function setUp() public {
        addressSetMock = new AddressSetMock();

        addresses.push(address(0x1));
        addresses.push(address(0x2));
        addresses.push(address(0x3));
    }

    function test_Add_AddsNewAddress() public {
        assertTrue(addressSetMock.add(addresses[0]));
        assertTrue(addressSetMock.contains(addresses[0]));
        assertEq(addressSetMock.length(), 1);
    }

    function test_Add_ReturnsFalseForDuplicate() public {
        assertTrue(addressSetMock.add(addresses[0]));
        assertFalse(addressSetMock.add(addresses[0]));
        assertEq(addressSetMock.length(), 1);
    }

    function test_Remove_RemovesExistingAddress() public {
        addressSetMock.add(addresses[0]);
        addressSetMock.add(addresses[1]);

        assertTrue(addressSetMock.remove(addresses[0]));
        assertFalse(addressSetMock.contains(addresses[0]));
        assertEq(addressSetMock.length(), 1);
    }

    function test_Remove_ReturnsFalseForNonExistent() public {
        assertFalse(addressSetMock.remove(addresses[0]));
    }

    function test_Contains_ChecksMembership() public {
        addressSetMock.add(addresses[0]);

        assertTrue(addressSetMock.contains(addresses[0]));
        assertFalse(addressSetMock.contains(addresses[1]));
    }

    function test_Length_ReturnsSetSize() public {
        assertEq(addressSetMock.length(), 0);

        addressSetMock.add(addresses[0]);
        assertEq(addressSetMock.length(), 1);

        addressSetMock.add(addresses[1]);
        assertEq(addressSetMock.length(), 2);

        addressSetMock.remove(addresses[0]);
        assertEq(addressSetMock.length(), 1);
    }

    function test_At_ReturnsAddressAtIndex() public {
        addressSetMock.add(addresses[0]);
        addressSetMock.add(addresses[1]);

        assertEq(addressSetMock.at(0), addresses[0]);
        assertEq(addressSetMock.at(1), addresses[1]);
    }

    function test_At_RevertsOnOutOfBounds() public {
        vm.expectRevert();
        addressSetMock.at(0);
    }

    function test_Get_ReturnsAllAddresses() public {
        for (uint256 i = 0; i < addresses.length; i++) {
            addressSetMock.add(addresses[i]);
        }

        address[] memory values = addressSetMock.get();
        assertEq(values.length, addresses.length);

        for (uint256 i = 0; i < values.length; i++) {
            assertTrue(addressSetMock.contains(values[i]));
        }
    }
}
