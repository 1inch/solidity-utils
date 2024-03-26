// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "../libraries/SafeERC20.sol";

/**
 * @title PermitAndCall
 * @dev Abstract contract to support permit and action execution in a single transaction.
 * Allows tokens that implement EIP-2612 permits, DAI-like permits, USDC-like permits and Permit2 to be approved and spent in a single transaction.
 */
abstract contract PermitAndCall {
    using SafeERC20 for IERC20;

    /**
     * @notice Executes a permit for an ERC20 token and then a specified action in a single transaction.
     * @param permit ERC20 token address (20 bytes) concatinated with the permit data, allowing this contract to spend the token.
     * Format: [token address (20 bytes)][permit data]
     * @param action The data representing the action to be executed after the permit.
     */
    function permitAndCall(bytes calldata permit, bytes calldata action) external payable {
        IERC20(address(bytes20(permit))).tryPermit(permit[20:]);
        // solhint-disable-next-line no-inline-assembly
        assembly ("memory-safe") {
            let ptr := mload(0x40)
            calldatacopy(ptr, action.offset, action.length)
            let success := delegatecall(gas(), address(), ptr, action.length, 0, 0)
            returndatacopy(ptr, 0, returndatasize())
            switch success
            case 0 {
                revert(ptr, returndatasize())
            }
            default {
                return(ptr, returndatasize())
            }
        }
    }
}
