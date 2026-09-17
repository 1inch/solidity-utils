// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Rescuable } from "../../mixins/Rescuable.sol";

contract RescuableMock is Rescuable {
    constructor(address owner) Rescuable(owner) {}
    receive() external payable {}
}
