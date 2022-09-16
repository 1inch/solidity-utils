// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "./SafeERC20.sol";
import "./StringUtil.sol";

interface IERC20MetadataUppercase {
    function NAME() external view returns (string memory);  // solhint-disable-line func-name-mixedcase
    function SYMBOL() external view returns (string memory);  // solhint-disable-line func-name-mixedcase
}

library UniERC20 {
    using SafeERC20 for IERC20;

    error InsufficientBalance();
    error ETHSendFailed();
    error ApproveCalledOnETH();
    error NotEnoughValue();
    error FromIsNotSender();
    error ToIsNotThis();

    IERC20 private constant _ETH_ADDRESS = IERC20(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    IERC20 private constant _ZERO_ADDRESS = IERC20(address(0));

    function isETH(IERC20 token) internal pure returns (bool) {
        return (token == _ZERO_ADDRESS || token == _ETH_ADDRESS);
    }

    function uniBalanceOf(IERC20 token, address account) internal view returns (uint256) {
        if (isETH(token)) {
            return account.balance;
        } else {
            return token.balanceOf(account);
        }
    }

    function uniTransfer(IERC20 token, address payable to, uint256 amount) internal {
        if (amount > 0) {
            if (isETH(token)) {
                if (address(this).balance < amount) revert InsufficientBalance();
                (bool success, ) = to.call{value: amount}("");  // solhint-disable-line avoid-low-level-calls
                if (!success) revert ETHSendFailed();
            } else {
                token.safeTransfer(to, amount);
            }
        }
    }

    function uniTransferFrom(IERC20 token, address payable from, address to, uint256 amount) internal {
        if (amount > 0) {
            if (isETH(token)) {
                if (msg.value < amount) revert NotEnoughValue();
                if (from != msg.sender) revert FromIsNotSender();
                if (to != address(this)) revert ToIsNotThis();
                if (msg.value > amount) {
                    // Return remainder if exist
                    unchecked {
                        (bool success, ) = to.call{value: msg.value - amount}("");  // solhint-disable-line avoid-low-level-calls
                        if (!success) revert ETHSendFailed();
                    }
                }
            } else {
                token.safeTransferFrom(from, to, amount);
            }
        }
    }

    function uniSymbol(IERC20 token) internal view returns(string memory) {
        return _uniDecode(token, IERC20Metadata.symbol.selector, IERC20MetadataUppercase.SYMBOL.selector);
    }

    function uniName(IERC20 token) internal view returns(string memory) {
        return _uniDecode(token, IERC20Metadata.name.selector, IERC20MetadataUppercase.NAME.selector);
    }

    function uniApprove(IERC20 token, address to, uint256 amount) internal {
        if (isETH(token)) revert ApproveCalledOnETH();

        token.forceApprove(to, amount);
    }

    /// 20K gas is provided to account for possible implementations of name/symbol
    /// (token implementation might be behind proxy or store the value in storage)
    function _uniDecode(IERC20 token, bytes4 lowerCaseSelector, bytes4 upperCaseSelector) private view returns(string memory) {
        if (isETH(token)) {
            return "ETH";
        }

        (bool success, bytes memory data) = address(token).staticcall{ gas: 20000 }(
            abi.encodeWithSelector(lowerCaseSelector)
        );
        if (!success) {
            (success, data) = address(token).staticcall{ gas: 20000 }(
                abi.encodeWithSelector(upperCaseSelector)
            );
        }

        if (success && data.length >= 96) {
            (uint256 offset, uint256 len) = abi.decode(data, (uint256, uint256));
            if (offset == 0x20 && len > 0 && len <= 256) {
                return abi.decode(data, (string));
            }
        }

        if (success && data.length == 32) {
            uint256 len = 0;
            while (len < data.length && data[len] >= 0x20 && data[len] <= 0x7E) {
                unchecked {
                    len++;
                }
            }

            if (len > 0) {
                assembly { // solhint-disable-line no-inline-assembly
                    mstore(data, len)
                }
                return string(data);
            }
        }

        return StringUtil.toHex(address(token));
    }
}
