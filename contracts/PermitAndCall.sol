// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "./libraries/SafeERC20.sol";

abstract contract PermitAndCall {
    using SafeERC20 for IERC20;

    function permitAndCall(bytes calldata permit, bytes calldata action) external {
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
