// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title Simulator
 * @dev Contract that allows simulating delegatecalls without persisting state changes.
 * Always reverts with the simulation result, enabling off-chain simulation of transactions.
 */
contract Simulator {
    /**
     * @dev Error containing the simulation result.
     * @param delegatee The address that was called via delegatecall.
     * @param data The calldata that was passed to the delegatee.
     * @param success Whether the delegatecall succeeded.
     * @param result The return data or revert reason from the delegatecall.
     */
    error Simulated(address delegatee, bytes data, bool success, bytes result);

    /**
     * @dev Simulates a delegatecall to the target address and reverts with the result.
     * This function always reverts, returning the simulation outcome in the error data.
     * Can be used for off-chain simulation to preview transaction effects.
     * @param delegatee The address to delegatecall to.
     * @param data The calldata to pass to the delegatee.
     */
    function simulate(address delegatee, bytes calldata data) external payable {
        (bool success, bytes memory result) = delegatee.delegatecall(data); // solhint-disable-line avoid-low-level-calls
        revert Simulated(delegatee, data, success, result);
    }
}
