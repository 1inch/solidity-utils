
## ReentrancyGuard

_Abstract contract providing reentrancy protection using transient storage locks (EIP-1153).
More gas-efficient than traditional storage-based reentrancy guards.

Use the built-in `_lock` for simple cases:
```solidity
function swap(...) external nonReentrant {
    // protected code
}

function doMagic(...) external onlyNonReentrantCall {
    // must be called within a nonReentrant context
}
```

Or use custom locks for more granular control:
```solidity
TransientLock private _myLock;

function swap(...) external nonReentrantLock(_myLock) {
    // protected code
}

function doMagic(...) external onlyNonReentrantCallLock(_myLock) {
    // must be called within a nonReentrantLock(_myLock) context
}
```_

### Functions list
- [_inNonReentrantCall() internal](#_innonreentrantcall)

### Errors list
- [MissingNonReentrantModifier() ](#missingnonreentrantmodifier)

### Functions
### _inNonReentrantCall

```solidity
function _inNonReentrantCall() internal view returns (bool)
```

_Returns true if currently within a nonReentrant call using the built-in lock._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | bool | True if the built-in lock is currently held, false otherwise. |

### Errors
### MissingNonReentrantModifier

```solidity
error MissingNonReentrantModifier()
```

_Error thrown when a function requiring nonReentrant context is called outside of one._

