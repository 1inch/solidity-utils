// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "./TokenMock.sol";

contract ERC20PermitMock is ERC20Permit, TokenMock {
    constructor(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialBalance
    ) payable TokenMock(name, symbol) ERC20Permit(name) {
        _mint(initialAccount, initialBalance);
    }
}
