// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

abstract contract TestHelpers is Test {
    address constant PERMIT2_ADDRESS = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    uint256 constant MAX_UINT256 = type(uint256).max;

    modifier skipIfCoverage() {
        if (vm.envOr("COVERAGE", false)) {
            vm.skip(true);
        }
        _;
    }

    function toEther(uint256 amount) internal pure returns (uint256) {
        return amount * 1e18;
    }

    function trackBalance(address token, address account) internal view returns (uint256) {
        if (token == address(0)) {
            return account.balance;
        }
        (bool success, bytes memory data) = token.staticcall(
            abi.encodeWithSignature("balanceOf(address)", account)
        );
        require(success && data.length >= 32);
        return abi.decode(data, (uint256));
    }
}
