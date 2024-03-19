// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../mixins/OnlyWethReceiver.sol";

contract WethReceiverMock is OnlyWethReceiver {
    // solhint-disable-next-line no-empty-blocks
    constructor(address weth) OnlyWethReceiver(weth) {}
}
