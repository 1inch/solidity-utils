// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../interfaces/IERC20MetadataUppercase.sol";
import "./SafeERC20.sol";
import "./StringUtil.sol";

/**
 * @title UniERC20
 * @dev Library to abstract the handling of ETH and ERC20 tokens, enabling unified interaction with both. It allows usage of ETH as ERC20.
 * Utilizes SafeERC20 for ERC20 interactions and provides additional utility functions.
 */
library UniERC20 {
    using SafeERC20 for IERC20;

    error InsufficientBalance();
    error ApproveCalledOnETH();
    error NotEnoughValue();
    error FromIsNotSender();
    error ToIsNotThis();
    error ETHTransferFailed();

    uint256 private constant _RAW_CALL_GAS_LIMIT = 5000;
    IERC20 private constant _ETH_ADDRESS = IERC20(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    IERC20 private constant _ZERO_ADDRESS = IERC20(address(0));

    /**
     * @dev Determines if the specified token is ETH.
     * @param token The token to check.
     * @return bool True if the token is ETH, false otherwise.
     */
    function isETH(IERC20 token) internal pure returns (bool) {
        return (token == _ZERO_ADDRESS || token == _ETH_ADDRESS);
    }

    /**
     * @dev Retrieves the balance of the specified token for an account.
     * @param token The token to query the balance of.
     * @param account The address of the account.
     * @return uint256 The balance of the token for the specified account.
     */
    function uniBalanceOf(IERC20 token, address account) internal view returns (uint256) {
        if (isETH(token)) {
            return account.balance;
        } else {
            return token.balanceOf(account);
        }
    }

    /**
     * @dev Transfers a specified amount of the token to a given address.
     * Note: Does nothing if the amount is zero.
     * @param token The token to transfer.
     * @param to The address to transfer the token to.
     * @param amount The amount of the token to transfer.
     */
    function uniTransfer(
        IERC20 token,
        address payable to,
        uint256 amount
    ) internal {
        if (amount > 0) {
            if (isETH(token)) {
                if (address(this).balance < amount) revert InsufficientBalance();
                // solhint-disable-next-line avoid-low-level-calls
                (bool success, ) = to.call{value: amount, gas: _RAW_CALL_GAS_LIMIT}("");
                if (!success) revert ETHTransferFailed();
            } else {
                token.safeTransfer(to, amount);
            }
        }
    }

    /**
     * @dev Transfers a specified amount of the token from one address to another.
     * Note: Does nothing if the amount is zero.
     * @param token The token to transfer.
     * @param from The address to transfer the token from.
     * @param to The address to transfer the token to.
     * @param amount The amount of the token to transfer.
     */
    function uniTransferFrom(
        IERC20 token,
        address payable from,
        address to,
        uint256 amount
    ) internal {
        if (amount > 0) {
            if (isETH(token)) {
                if (msg.value < amount) revert NotEnoughValue();
                if (from != msg.sender) revert FromIsNotSender();
                if (to != address(this)) revert ToIsNotThis();
                if (msg.value > amount) {
                    // Return remainder if exist
                    unchecked {
                        // solhint-disable-next-line avoid-low-level-calls
                        (bool success, ) = from.call{value: msg.value - amount, gas: _RAW_CALL_GAS_LIMIT}("");
                        if (!success) revert ETHTransferFailed();
                    }
                }
            } else {
                token.safeTransferFrom(from, to, amount);
            }
        }
    }

    /**
     * @dev Retrieves the symbol from ERC20 metadata of the specified token.
     * @param token The token to retrieve the symbol of.
     * @return string The symbol of the token.
     */
    function uniSymbol(IERC20 token) internal view returns (string memory) {
        return _uniDecode(token, IERC20Metadata.symbol.selector, IERC20MetadataUppercase.SYMBOL.selector);
    }

    /**
     * @dev Retrieves the name from ERC20 metadata of the specified token.
     * @param token The token to retrieve the name of.
     * @return string The name of the token.
     */
    function uniName(IERC20 token) internal view returns (string memory) {
        return _uniDecode(token, IERC20Metadata.name.selector, IERC20MetadataUppercase.NAME.selector);
    }

    /**
     * @dev forceApprove the specified amount of the token to a given address.
     * Reverts if the token is ETH.
     * @param token The token to approve.
     * @param to The address to approve the token to.
     * @param amount The amount of the token to approve.
     */
    function uniApprove(
        IERC20 token,
        address to,
        uint256 amount
    ) internal {
        if (isETH(token)) revert ApproveCalledOnETH();

        token.forceApprove(to, amount);
    }

    /**
     * @dev Internal function to decode token metadata (name or symbol).
     * 20K gas is provided to account for possible implementations of name/symbol
     * (token implementation might be behind proxy or store the value in storage)
     * @param token The token to decode metadata for.
     * @param lowerCaseSelector The selector for the lowercase metadata function.
     * @param upperCaseSelector The selector for the uppercase metadata function.
     * @return result The decoded metadata value.
     */
    function _uniDecode(
        IERC20 token,
        bytes4 lowerCaseSelector,
        bytes4 upperCaseSelector
    ) private view returns (string memory result) {
        if (isETH(token)) {
            return "ETH";
        }

        (bool success, bytes memory data) = address(token).staticcall{gas: 20000}(
            abi.encodeWithSelector(lowerCaseSelector)
        );
        if (!success) {
            (success, data) = address(token).staticcall{gas: 20000}(abi.encodeWithSelector(upperCaseSelector));
        }

        if (success && data.length >= 0x40) {
            (uint256 offset, uint256 len) = abi.decode(data, (uint256, uint256));
            /*
                return data is padded up to 32 bytes with ABI encoder also sometimes
                there is extra 32 bytes of zeros padded in the end:
                https://github.com/ethereum/solidity/issues/10170
                because of that we can't check for equality and instead check
                that overall data length is greater or equal than string length + extra 64 bytes
            */
            if (offset == 0x20 && data.length >= 0x40 + len) {
                assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
                    result := add(data, 0x40)
                }
                return result;
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
                assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
                    mstore(data, len)
                }
                return string(data);
            }
        }

        return StringUtil.toHex(address(token));
    }
}
