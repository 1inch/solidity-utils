// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract ERC20DisableApprove is IERC20 {
    error ApproveDisabled();

    function approve(address /* spender */, uint256 /* amount */) public pure override returns (bool) {
        revert ApproveDisabled();
    }
}