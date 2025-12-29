// SPDX-License-Identifier: MIT
// solhint-disable one-contract-per-file
pragma solidity ^0.8.30;

import "../../mixins/ReentrancyGuard.sol";

interface IReentrancyAttacker {
    function attack() external;
    function attackCustomLock() external;
}

contract ReentrancyGuardMock is ReentrancyGuard {
    uint256 public counter;
    TransientLock private _customLock;

    // Built-in lock tests
    function protectedIncrement() external nonReentrant {
        counter++;
    }

    function protectedIncrementAndCall(address target) external nonReentrant {
        counter++;
        IReentrancyAttacker(target).attack();
    }

    function onlyInProtectedContext() external onlyNonReentrantCall {
        counter++;
    }

    function callOnlyInProtectedContext() external nonReentrant {
        this.onlyInProtectedContext();
    }

    function callOnlyInProtectedContextWithoutGuard() external {
        this.onlyInProtectedContext();
    }

    function inNonReentrantCall() external view returns (bool) {
        return _inNonReentrantCall();
    }

    function checkInNonReentrantCall() external nonReentrant returns (bool) {
        return _inNonReentrantCall();
    }

    // Custom lock tests (nonReentrantLock and onlyNonReentrantCallLock)
    function protectedIncrementWithCustomLock() external nonReentrantLock(_customLock) {
        counter++;
    }

    function protectedIncrementWithCustomLockAndCall(address target) external nonReentrantLock(_customLock) {
        counter++;
        IReentrancyAttacker(target).attackCustomLock();
    }

    function onlyInProtectedContextCustomLock() external onlyNonReentrantCallLock(_customLock) {
        counter++;
    }

    function callOnlyInProtectedContextCustomLock() external nonReentrantLock(_customLock) {
        this.onlyInProtectedContextCustomLock();
    }

    function callOnlyInProtectedContextCustomLockWithoutGuard() external {
        this.onlyInProtectedContextCustomLock();
    }
}

contract ReentrancyAttacker {
    ReentrancyGuardMock public target;
    bool public attacked;
    bool public attackedCustomLock;

    constructor(address _target) {
        target = ReentrancyGuardMock(_target);
    }

    function attack() external {
        if (!attacked) {
            attacked = true;
            target.protectedIncrement();
        }
    }

    function attackCustomLock() external {
        if (!attackedCustomLock) {
            attackedCustomLock = true;
            target.protectedIncrementWithCustomLock();
        }
    }
}
