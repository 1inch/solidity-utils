
## TransientLock

_Struct representing a transient storage-based lock for reentrancy protection._

```solidity
struct TransientLock {
  struct tuint256 _raw;
}
```

## TransientLockLib

_Library for managing transient storage locks.
Provides gas-efficient reentrancy protection using EIP-1153 transient storage._

### Functions list
- [lock(self) internal](#lock)
- [unlock(self) internal](#unlock)
- [isLocked(self) internal](#islocked)

### Errors list
- [UnexpectedLock() ](#unexpectedlock)
- [UnexpectedUnlock() ](#unexpectedunlock)

### Functions
### lock

```solidity
function lock(struct TransientLock self) internal
```

_Acquires the lock. Reverts with UnexpectedLock if already locked._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct TransientLock | The transient lock to acquire. |

### unlock

```solidity
function unlock(struct TransientLock self) internal
```

_Releases the lock. Reverts with UnexpectedUnlock if not currently locked._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct TransientLock | The transient lock to release. |

### isLocked

```solidity
function isLocked(struct TransientLock self) internal view returns (bool)
```

_Checks if the lock is currently held._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct TransientLock | The transient lock to check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | bool | True if the lock is held, false otherwise. |

### Errors
### UnexpectedLock

```solidity
error UnexpectedLock()
```

_Error thrown when attempting to lock an already locked state._

### UnexpectedUnlock

```solidity
error UnexpectedUnlock()
```

_Error thrown when attempting to unlock a non-locked state._

