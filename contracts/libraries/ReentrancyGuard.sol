// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { TransientLib, tuint256 } from "./Transient.sol";

struct ReentrancyGuard {
    tuint256 _raw;
}

library ReentrancyGuardLib {
    using TransientLib for tuint256;

    error ReentrantCallDetected();
    error EnterLeaveDisbalance();

    function enter(ReentrancyGuard storage self) internal {
        if (self._raw.inc() != 1) revert ReentrantCallDetected();
    }

    function enterNoIncrement(ReentrancyGuard storage self) internal view {
        if (self._raw.tload() != 0) revert ReentrantCallDetected();
    }

    function leave(ReentrancyGuard storage self) internal {
        self._raw.dec(EnterLeaveDisbalance.selector);
    }
}
