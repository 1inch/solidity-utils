// SPDX-License-Identifier: MIT
// solhint-disable one-contract-per-file

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../libraries/UniERC20.sol";

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

    function transfer(address payable to, uint256 amount) external payable {
        _token.uniTransfer(to, amount);
    }

    function transferFrom(
        address payable from,
        address to,
        uint256 amount
    ) external payable {
        _token.uniTransferFrom(from, to, amount);
    }

    function approve(address spender, uint256 amount) external {
        _token.uniApprove(spender, amount);
    }

    function balanceOf(address account) external view returns (uint256) {
        return _token.uniBalanceOf(account);
    }

    function name() external view returns (string memory) {
        return _token.uniName();
    }

    function symbol() external view returns (string memory) {
        return _token.uniSymbol();
    }

    function isETH() external view returns (bool) {
        return _token.isETH();
    }
}

contract ETHBadReceiver {
    using UniERC20 for IERC20;

    error ReceiveFailed();

    IERC20 private _token;
    IUniERC20Wrapper private _wrapper;

    constructor(IERC20 token, IUniERC20Wrapper wrapper) {
        _token = token;
        _wrapper = wrapper;
    }

    function transfer(address to, uint256 amount) external payable {
        _wrapper.transferFrom{value: msg.value}(payable(address(this)), to, amount);
    }

    receive() external payable {
        revert ReceiveFailed();
    }
}

contract ERC20Capitals {
    string public NAME; // solhint-disable-line var-name-mixedcase
    string public SYMBOL; // solhint-disable-line var-name-mixedcase

    constructor(string memory name, string memory symbol) {
        NAME = name;
        SYMBOL = symbol;
    }
}

contract ERC20bytes32Capitals {
    bytes32 public NAME; // solhint-disable-line var-name-mixedcase
    bytes32 public SYMBOL; // solhint-disable-line var-name-mixedcase

    constructor(bytes32 name, bytes32 symbol) {
        NAME = name;
        SYMBOL = symbol;
    }
}

contract ERC20bytes32 {
    bytes32 public name;
    bytes32 public symbol;

    constructor(bytes32 name_, bytes32 symbol_) {
        name = name_;
        symbol = symbol_;
    }
}
