// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title SafeSendLib
 * @dev Library for safely sending Ether to a recipient address.
 */
library SafeSendLib {
    /**
     * @dev Sends `amount` wei to address `to` in constructor by calling selfdestruct.
     * Even recipients that are contracts with revert in fallback() or receive() will receive the funds.
     * @param to The address to send Ether to.
     * @param amount The amount of wei to send.
     */
    function safeSend(address to, uint256 amount) internal {
        assembly ("memory-safe") {
            mstore(0, to)
            mstore8(11, 0x73) // 0x73 = PUSH20 opcode
            mstore8(32, 0xff) // 0xff = SELFDESTRUCT opcode
            pop(create(amount, 11, 22))
        }
    }
}
