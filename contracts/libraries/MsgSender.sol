// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol"
;
import { TransientArray } from "./TransientArray.sol";

// Stack of senders for each function selector
contract MsgSender is Context {
    using Math for uint256;
    using TransientArray for TransientArray.Address;

    error MsgSenderPopExpectedMismatch(address expected, address popped);

    mapping(address caller =>
        mapping(bytes4 => TransientArray.Address)) private _senders;

    function _msgSender(address caller, bytes4 selector, uint256 index) internal view virtual returns(address) {
        return _senders[caller][selector].at(index);
    }

    function _msgSenderLength(address caller, bytes4 selector) internal view returns (uint256) {
        return _senders[caller][selector].length();
    }

    function _msgSenderPush(address caller, bytes4 selector, address newSender) internal {
        _senders[caller][selector].push(newSender);
    }

    function _msgSenderPop(address caller, bytes4 selector, address expected) internal {
        TransientArray.Address storage stack = _senders[caller][selector];
        address popped = stack.pop();
        if (expected != popped) revert MsgSenderPopExpectedMismatch(expected, popped);
    }

    function _msgSender() internal view virtual override returns(address) {
        TransientArray.Address storage stack = _senders[msg.sender][msg.sig];
        (bool success, uint256 lastIndex) = stack.length().trySub(1);
        if (!success) {
            return super._msgSender(); // Fallback to Context's _msgSender if stack is empty
        }
        return stack.unsafeAt(lastIndex); // Use the last pushed sender
    }
}
