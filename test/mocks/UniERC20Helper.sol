// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../contracts/libraries/UniERC20.sol";

interface IUniERC20Wrapper {
    function transferFrom(
        address payable from,
        address to,
        uint256 amount
    ) external payable;
}

contract UniERC20Wrapper {
    using UniERC20 for IERC20;

    IERC20 private _token;

    constructor(IERC20 token) {
        _token = token;
    }

    function transfer(address payable to, uint256 amount) public payable {
        _token.uniTransfer(to, amount);
    }

    function transferFrom(
        address payable from,
        address to,
        uint256 amount
    ) public payable {
        _token.uniTransferFrom(from, to, amount);
    }

    function approve(address spender, uint256 amount) public {
        _token.uniApprove(spender, amount);
    }

    function balanceOf(address account) public view returns (uint256) {
        return _token.uniBalanceOf(account);
    }

    function name() public view returns (string memory) {
        return _token.uniName();
    }

    function symbol() public view returns (string memory) {
        return _token.uniSymbol();
    }

    function isETH() public view returns (bool) {
        return _token.isETH();
    }
}

contract ETHBadReceiver {
    using UniERC20 for IERC20;

    IERC20 private _token;
    IUniERC20Wrapper private _wrapper;

    constructor(IERC20 token, IUniERC20Wrapper wrapper) {
        _token = token;
        _wrapper = wrapper;
    }

    function transfer(address to, uint256 amount) public payable {
        _wrapper.transferFrom{value: msg.value}(payable(address(this)), to, amount);
    }

    receive() external payable {
        revert();
    }
}

contract ERC20Capitals {
    string public NAME;
    string public SYMBOL;

    constructor(string memory name, string memory symbol) {
        NAME = name;
        SYMBOL = symbol;
    }
}
