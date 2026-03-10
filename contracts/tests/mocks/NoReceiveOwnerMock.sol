// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { IRescuable } from "../../interfaces/IRescuable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @dev Owner contract that cannot receive ETH, used to test ETHTransferFailed.
contract NoReceiveOwnerMock {
    IRescuable private immutable _TARGET;

    constructor(IRescuable target) {
        _TARGET = target;
    }

    function rescueFunds(IERC20 token, uint256 amount) external {
        _TARGET.rescueFunds(token, amount);
    }
}
