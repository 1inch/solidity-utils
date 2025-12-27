// SPDX-License-Identifier: MIT
// solhint-disable one-contract-per-file
pragma solidity ^0.8.30;

import "../../mixins/ReentrancyGuard.sol";

interface IReentrancyAttacker {
    function attack() external;
}

contract ReentrancyGuardMock is ReentrancyGuard {
    uint256 public counter;

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
}

contract ReentrancyAttacker {
    ReentrancyGuardMock public target;
    bool public attacked;

    constructor(address _target) {
        target = ReentrancyGuardMock(_target);
    }

    function attack() external {
        if (!attacked) {
            attacked = true;
            target.protectedIncrement();
        }
    }
}
