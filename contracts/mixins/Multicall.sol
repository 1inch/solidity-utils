// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/**
 * @title Multicall
 * @dev Contract that enables batching multiple calls to itself in a single transaction.
 * Uses delegatecall to execute each call in the context of the inheriting contract.
+ * NOTICE: multicall is open for any caller! Every target function MUST have its own access‑control check.
+ * Only call internal functions of this contract, DO NOT use for external contract calls.
 * If any call fails, the entire transaction reverts with the original error.
 */
‑contract Multicall {
+abstract contract Multicall {
    /**
     * @dev Executes multiple calls to this contract in a single transaction.
     * Each call is executed via delegatecall, preserving the contract's storage context.
     * If any call fails, the entire transaction reverts with the original error.
     * @param data An array of encoded function calls to execute.
+     * @return results Return data for each sub‑call
     */
‑    function multicall(bytes[] calldata data) external {
+    function multicall(bytes[] calldata data) external returns (bytes[] memory results) {
+        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; i++) {
‑            (bool success,) = address(this).delegatecall(data[i]); // solhint-disable-line avoid-low-level-calls
+            (bool success, bytes memory returndata) = address(this).delegatecall(data[i]); // solhint-disable-line avoid-low-level-calls
            if (!success) {
                assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
                    let ptr := mload(0x40)
                    returndatacopy(ptr, 0, returndatasize())
                    revert(ptr, returndatasize())
                }
            }
+            results[i] = returndata;
        }
    }
}
