// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

abstract contract ResultMulticallMock {
    function multicall(bytes[] calldata data) external returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]); // solhint-disable-line avoid-low-level-calls
            if (!success) {
                assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
                    revert(add(result, 0x20), mload(result))
                }
            }
            results[i] = result;
        }
    }
}
