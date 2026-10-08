// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { SafeERC20 } from "../../libraries/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PermitableMock {
    using SafeERC20 for IERC20;

    function mockPermit(IERC20 token, bytes calldata permit) external {
        token.safePermit(permit);
    }

    function mockPermitCompact(IERC20 token, bytes calldata permit) external {
        token.safePermit(msg.sender, address(this), permit);
    }

    /// @dev Call two `tryPermit` calls in one tx, so the second sees memory left by the first.
    function mockPermitThenCompact(IERC20 token, bytes calldata permit, bytes calldata compactPermit) external {
        token.safePermit(permit);
        token.safePermit(msg.sender, address(this), compactPermit);
    }
}
