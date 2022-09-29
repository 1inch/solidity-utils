// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../contracts/EthReceiver.sol";

contract EthReceiverMock is EthReceiver {
    constructor() EthReceiver() {}
}
