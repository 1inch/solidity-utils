// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "../interfaces/IDaiLikePermit.sol";
import "../libraries/RevertReasonForwarder.sol";

library SafestERC20 {
    error SafestTransferFailed();
    error SafestTransferFromFailed();
    error SafestApproveFailed();
    error SafestIncreaseAllowanceFailed();
    error SafestDecreaseAllowanceFailed();
    error SafestPermitBadLength();
    error SafestPermitNotSucceed();

    // Ensures method do not revert or return boolean `true`, admits call to non-smart-contract
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        if (!_makeCall(token, token.transfer.selector, 68, uint160(to), value, 0)) {
            revert SafestTransferFailed();
        }
    }

    // Ensures method do not revert or return boolean `true`, admits call to non-smart-contract
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        if (!_makeCall(token, token.transferFrom.selector, 100, uint160(from), uint160(to), value)) {
            revert SafestTransferFromFailed();
        }
    }

    // Ensures method do not revert or return boolean `true`, admits call to non-smart-contract
    function safeApprove(IERC20 token, address spender, uint256 value) internal {
        if (!_makeCall(token, token.approve.selector, 68, uint160(spender), value, 0)) {
            if (!_makeCall(token, token.approve.selector, 68, uint160(spender), 0, 0) ||
                !_makeCall(token, token.approve.selector, 68, uint160(spender), value, 0))
            {
                revert SafestApproveFailed();
            }
        }
    }

    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 allowance = token.allowance(address(this), spender);
        if (value > type(uint256).max - allowance) revert SafestIncreaseAllowanceFailed();
        safeApprove(token, spender, allowance + value);
    }

    function safeDecreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 allowance = token.allowance(address(this), spender);
        if (value > allowance) revert SafestDecreaseAllowanceFailed();
        safeApprove(token, spender, allowance - value);
    }

    function safePermit(IERC20 token, address owner, bytes calldata permit) internal {
        uint256 nonceBefore = IERC20Permit(address(token)).nonces(owner);
        bool success;
        if (permit.length == 32 * 7) {
            // solhint-disable-next-line avoid-low-level-calls
            (success,) = address(token).call(abi.encodePacked(IERC20Permit.permit.selector, permit));
        } else if (permit.length == 32 * 8) {
            // solhint-disable-next-line avoid-low-level-calls
            (success,) = address(token).call(abi.encodePacked(IDaiLikePermit.permit.selector, permit));
        } else {
            revert SafestPermitBadLength();
        }

        if (!success) {
            RevertReasonForwarder.reRevert();
        }
        uint256 nonceAfter = IERC20Permit(address(token)).nonces(owner);
        if (nonceAfter != nonceBefore + 1) revert SafestPermitNotSucceed();
    }

    function _makeCall(IERC20 token, bytes4 selector, uint len, uint arg1, uint arg2, uint arg3) private returns(bool done) {
        assembly { // solhint-disable-line no-inline-assembly
            let data := mload(0x40)
            mstore(0x40, add(data, len))

            mstore(data, selector)
            mstore(add(data, 0x04), arg1)
            mstore(add(data, 0x24), arg2)
            if eq(len, 100) {
                mstore(add(data, 0x44), arg3)
            }
            let success := call(gas(), token, 0, data, len, 0x0, 0x20)
            done := and(success, or(iszero(returndatasize()), eq(mload(0), 1)))
        }
    }
}
