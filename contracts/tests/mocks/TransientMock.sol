// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../../libraries/Transient.sol";

contract TransientMock {
    using TransientLib for tuint256;
    using TransientLib for taddress;
    using TransientLib for tbytes32;

    struct Storage {
        uint256 _padding;
        tuint256 uintValue;
        taddress addressValue;
        tbytes32 bytes32Value;
    }

    Storage private _storage;

    // tuint256 functions
    function tloadUint() external view returns (uint256) {
        return _storage.uintValue.tload();
    }

    function tstoreUint(uint256 value) external {
        _storage.uintValue.tstore(value);
    }

    function inc() external returns (uint256) {
        return _storage.uintValue.inc();
    }

    function incWithException(bytes4 exception) external returns (uint256) {
        return _storage.uintValue.inc(exception);
    }

    function unsafeInc() external returns (uint256) {
        return _storage.uintValue.unsafeInc();
    }

    function dec() external returns (uint256) {
        return _storage.uintValue.dec();
    }

    function decWithException(bytes4 exception) external returns (uint256) {
        return _storage.uintValue.dec(exception);
    }

    function unsafeDec() external returns (uint256) {
        return _storage.uintValue.unsafeDec();
    }

    function initAndAdd(uint256 initialValue, uint256 toAdd) external returns (uint256) {
        return _storage.uintValue.initAndAdd(initialValue, toAdd);
    }

    // Overflow test: store max value then increment
    function incFromMaxValue() external returns (uint256) {
        _storage.uintValue.tstore(type(uint256).max);
        return _storage.uintValue.inc();
    }

    function incFromMaxValueWithException(bytes4 exception) external returns (uint256) {
        _storage.uintValue.tstore(type(uint256).max);
        return _storage.uintValue.inc(exception);
    }

    // taddress functions
    function tloadAddress() external view returns (address) {
        return _storage.addressValue.tload();
    }

    function tstoreAddress(address value) external {
        _storage.addressValue.tstore(value);
    }

    // tbytes32 functions
    function tloadBytes32() external view returns (bytes32) {
        return _storage.bytes32Value.tload();
    }

    function tstoreBytes32(bytes32 value) external {
        _storage.bytes32Value.tstore(value);
    }

    // offset verification
    function computedOffset() external pure returns (bytes32) {
        return keccak256(abi.encode(uint256(keccak256("TransientTest.storage.Offset")) - 1)) & ~bytes32(uint256(0xff));
    }

    function storedOffset() external pure returns (bytes32 ret) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            ret := 0xb2e1616e94c4f038b21d9137633825dc3f28ecaa196ae6785bc038208b529200
        }
    }
}
