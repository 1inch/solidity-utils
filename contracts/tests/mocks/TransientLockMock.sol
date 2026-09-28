// SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

import { TransientLock, TransientLockLib } from "../../libraries/TransientLock.sol";
import { ResultMulticallMock } from "./ResultMulticallMock.sol";

contract TransientLockMock is ResultMulticallMock {
    using TransientLockLib for TransientLock;

    TransientLock private _lock;

    function lock() external {
        _lock.lock();
    }

    function unlock() external {
        _lock.unlock();
    }

    function isLocked() external view returns (bool) {
        return _lock.isLocked();
    }
}
