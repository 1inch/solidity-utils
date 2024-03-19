// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../mixins/EthReceiver.sol";

contract EthReceiverMock is EthReceiver {
    // solhint-disable-next-line no-empty-blocks
    constructor() EthReceiver() {}
}
