// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import { tuint256, taddress, tbytes32, TransientLib } from "../../libraries/Transient.sol";
import { ResultMulticallMock } from "./ResultMulticallMock.sol";

contract TransientMock is ResultMulticallMock {
    using TransientLib for tuint256;
    using TransientLib for taddress;
    using TransientLib for tbytes32;

    error MathOverflow();
    error MathUnderflow();
    error CustomError();

    bytes32 transient public nativeTransient0;
    bytes32 transient public nativeTransient1;
    bytes32 transient public nativeTransient2;
    bytes32 transient public nativeTransient3;
    bytes32 transient public nativeTransient4;

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

    function getAtSlot(bytes32 slot) external view returns (bytes32 value) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            value := tload(slot)
        }
    }
}
