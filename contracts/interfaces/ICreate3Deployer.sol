// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title ICreate3Deployer
 * @dev Interface for deploying contracts with deterministic addresses via CREATE3.
 */
interface ICreate3Deployer {
    /**
     * @notice Deploys a contract using CREATE3 with a given salt and bytecode.
     * @param salt Unique value to create deterministic address.
     * @param code Contract bytecode to deploy.
     * @return Address of the deployed contract.
     */
    function deploy(bytes32 salt, bytes calldata code) external returns (address);

    /**
     * @notice Computes the address of a contract deployed with the given salt.
     * @param salt Unique value used during deployment.
     * @return Address of the contract.
     */
    function addressOf(bytes32 salt) external view returns (address);
}
