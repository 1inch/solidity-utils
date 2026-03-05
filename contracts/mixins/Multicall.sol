// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title Multicall
 * @dev Contract that enables batching multiple calls to itself in a single transaction.
 * Uses delegatecall to execute each call in the context of the inheriting contract.
 */
contract Multicall {
    /**
     * @dev Executes multiple calls to this contract in a single transaction.
     * Each call is executed via delegatecall, preserving the contract's storage context.
     * If any call fails, the entire transaction reverts with the original error.
     * @param data An array of encoded function calls to execute.
     */
    function multicall(bytes[] calldata data) external {
        for (uint256 i = 0; i < data.length; i++) {
            (bool success,) = address(this).delegatecall(data[i]); // solhint-disable-line avoid-low-level-calls
            if (!success) {
                assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
                    let ptr := mload(0x40)
                    returndatacopy(ptr, 0, returndatasize())
                    revert(ptr, returndatasize())
                }
            }
        }
    }
}
