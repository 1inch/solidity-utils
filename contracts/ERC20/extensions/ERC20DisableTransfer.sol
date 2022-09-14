// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract ERC20DisableTransfer is IERC20 {
    error TransferDisabled();

    function transfer(address /* to */, uint256 /* amount */) public pure override returns (bool) {
        revert TransferDisabled();
    }
}