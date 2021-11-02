// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "../Permitable.sol";

contract PermitableMock is Permitable {
    // solhint-disable-next-line  private-vars-leading-underscore
    function __permit(address token, bytes calldata permit) external {
        _permit(token, permit);
    }
}
