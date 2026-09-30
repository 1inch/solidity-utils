// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import { tuint256, TransientLib } from "../../libraries/Transient.sol";
import { ResultMulticallMock } from "./ResultMulticallMock.sol";

// keccak256(abi.encode(uint256(keccak256("1inch.transient.TransientLib")) - 1)) & ~bytes32(uint256(0xff))
uint256 constant OFFSET = 0x1a13954c2572cec45a9d92caded783b3fb4cc57e763a0b45ca60104fe73a5800;

contract TransientAtMock is ResultMulticallMock layout at OFFSET {
    using TransientLib for tuint256;

    bytes32 transient public nativeTransient;

    struct Storage {
        tuint256 uintValue;
    }

    Storage private _storage;

    function tloadUint() external view returns (uint256) {
        return _storage.uintValue.tload();
    }

    function tstoreUint(uint256 value) external {
        _storage.uintValue.tstore(value);
    }

    function tstoreNative(bytes32 value) external {
        nativeTransient = value;
    }
}
