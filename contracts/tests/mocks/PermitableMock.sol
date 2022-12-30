// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

import "../../libraries/SafeERC20.sol";

contract PermitableMock {
    using SafeERC20 for IERC20;

    function mockPermit(IERC20 token, bytes calldata permit) external {
        token.safePermit(permit);
    }

    function mockPermitCompact(IERC20 token, address owner, address spender, bytes calldata permit) external {
        token.safePermit(owner, spender, permit);
    }
}
