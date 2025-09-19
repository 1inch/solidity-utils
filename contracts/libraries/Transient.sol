// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24; // tload/tstore are available since 0.8.24

struct tuint256 { // solhint-disable-line contract-name-camelcase
    uint256 _raw;
}

struct taddress { // solhint-disable-line contract-name-camelcase
    address _raw;
}

struct tbytes32 { // solhint-disable-line contract-name-camelcase
    bytes32 _raw;
}

/// @dev Library for drop-in replacement of uint256, address, and bytes32 with transient storage.
/// ```solidity
/// contract MagicProtocol {
///     using TransientLib for tuint256;
///
///     error ReentrantCallDetected();
///
///     struct ReentrancyLock {
///         tuint256 counter;
///     }
///
///     ReentrancyLock private _lock;
///
///     modifier nonReentrable {
///         require(_lock.counter.inc() == 1, ReentrantCallDetected());
///         _;
///         _lock.counter.dec();
///     }
///
///     function someMagicFunction(...) external nonReentrable {
///         ...
///         target.callSomeSuspiciousFunction(...);
///         ...
///     }
/// }
/// ```
library TransientLib {
    error MathOverflow();
    error MathUnderflow();

    // Functions for tuint256

    function tload(tuint256 storage self) internal view returns(uint256 ret) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            ret := tload(self.slot)
        }
    }

    function tstore(tuint256 storage self, uint256 value) internal {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            tstore(self.slot, value)
        }
    }

    function inc(tuint256 storage self) internal returns (uint256 incremented) {
        return inc(self, TransientLib.MathOverflow.selector);
    }

    function inc(tuint256 storage self, bytes4 exception) internal returns (uint256 incremented) {
        incremented = unsafeInc(self);
        if (incremented == 0) {
            assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
                mstore(0, exception)
                revert(0, 4)
            }
        }
    }

    function unsafeInc(tuint256 storage self) internal returns (uint256 incremented) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            incremented := add(tload(self.slot), 1)
            tstore(self.slot, incremented)
        }
    }

    function dec(tuint256 storage self) internal returns (uint256 decremented) {
        return dec(self, TransientLib.MathUnderflow.selector);
    }

    function dec(tuint256 storage self, bytes4 exception) internal returns (uint256 decremented) {
        decremented = unsafeDec(self);
        if (decremented == type(uint256).max) {
            assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
                mstore(0, exception)
                revert(0, 4)
            }
        }
    }

    function unsafeDec(tuint256 storage self) internal returns (uint256 decremented) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            decremented := sub(tload(self.slot), 1)
            tstore(self.slot, decremented)
        }
    }

    // Functions for taddress

    function tload(taddress storage self) internal view returns(address ret) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            ret := tload(self.slot)
        }
    }

    function tstore(taddress storage self, address value) internal {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            tstore(self.slot, value)
        }
    }

    // Functions for tbytes32

    function tload(tbytes32 storage self) internal view returns(bytes32 ret) {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            ret := tload(self.slot)
        }
    }

    function tstore(tbytes32 storage self, bytes32 value) internal {
        assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
            tstore(self.slot, value)
        }
    }
}
