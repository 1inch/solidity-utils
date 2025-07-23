// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { ReentrancyGuard, ReentrancyGuardLib } from "./ReentrancyGuard.sol";

abstract contract ReentrancyGuardBase {
    using ReentrancyGuardLib for ReentrancyGuard;

    ReentrancyGuard private _lock;

    modifier nonReentrant {
        _lock.enter();
        _;
        _lock.leave();
    }

    modifier nonReentrantView {
        _lock.enterNoIncrement();
        _;
    }

    modifier nonReentrantGuard(ReentrancyGuard storage lock) {
        lock.enter();
        _;
        lock.leave();
    }

    modifier nonReentrantViewGuard(ReentrancyGuard storage lock) {
        lock.enterNoIncrement();
        _;
    }
}
