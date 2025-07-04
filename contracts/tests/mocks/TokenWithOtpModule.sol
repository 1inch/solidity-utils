// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { TokenMock } from "../../mocks/TokenMock.sol";
import { OtpModule } from "../../mixins/OtpModule.sol";

contract TokenWithOtpModule is TokenMock, OtpModule {
    // solhint-disable-next-line no-empty-blocks
    constructor(string memory name, string memory symbol, string memory version) TokenMock(name, symbol) {}

    function transferWithOTP(bytes32 code, address to, uint256 value) external onlyOTP(code) returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }
}
