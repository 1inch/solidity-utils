// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract ERC20DisableTransferFrom is IERC20 {
    error TransferFromDisabled();

    function transferFrom(address /* from */, address /* to */, uint256 /* amount */) public pure override returns (bool) {
        revert TransferFromDisabled();
    }
}