// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./utils/TestHelpers.sol";
import "../contracts/tests/mocks/AddressLibMock.sol";
import "../contracts/libraries/AddressLib.sol";

contract AddressLibTest is TestHelpers {
    AddressLibMock public addressLibMock;
    uint256[] public flags;
    address public testAddress;

    function setUp() public {
        addressLibMock = new AddressLibMock();
        testAddress = address(0x1234567890123456789012345678901234567890);

        flags.push(1 << 160);
        flags.push(1 << 192);
        flags.push(1 << 255);
    }

    function test_Get_ReturnsCorrectAddressRegardlessOfFlags() public {
        assertEq(addressLibMock.get(Address.wrap(uint256(uint160(testAddress)))), testAddress);

        for (uint256 i = 0; i < flags.length; i++) {
            uint256 flaggedValue = uint256(uint160(testAddress)) | flags[i];
            assertEq(addressLibMock.get(Address.wrap(flaggedValue)), testAddress);
        }
    }

    function test_GetFlag_ReturnsTrueWhenFlagIsSet() public {
        for (uint256 i = 0; i < flags.length; i++) {
            uint256 flaggedValue = uint256(uint160(testAddress)) | flags[i];
            assertTrue(addressLibMock.getFlag(Address.wrap(flaggedValue), flags[i]));
            assertFalse(addressLibMock.getFlag(Address.wrap(flaggedValue), 1 << 161));
        }
    }

    function test_GetUint32_ReturnsValueAtOffset() public {
        uint256 flag = (1 << 160) + (1 << 193);
        uint256 flaggedValue = uint256(uint160(testAddress)) | flag;

        assertEq(addressLibMock.getUint32(Address.wrap(flaggedValue), 160), 1);
        assertEq(addressLibMock.getUint32(Address.wrap(flaggedValue), 193), 1);
    }

    function test_GetUint64_ReturnsValueAtOffset() public {
        uint256 flag = (1 << 160) + (1 << 225);
        uint256 flaggedValue = uint256(uint160(testAddress)) | flag;

        assertEq(addressLibMock.getUint64(Address.wrap(flaggedValue), 160), 1);
        assertEq(addressLibMock.getUint64(Address.wrap(flaggedValue), 225), 1);
    }
}
