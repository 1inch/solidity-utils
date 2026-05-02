
## tuint256

forge-lint: disable-next-line(pascal-case-struct)

```solidity
struct tuint256 {
  uint256 _raw;
}
```

## taddress

forge-lint: disable-next-line(pascal-case-struct)

```solidity
struct taddress {
  address _raw;
}
```

## tbytes32

forge-lint: disable-next-line(pascal-case-struct)

```solidity
struct tbytes32 {
  bytes32 _raw;
}
```

## TransientLib

_Library for drop-in replacement of uint256, address, and bytes32 with transient storage.
Transient storage (EIP-1153) is cleared after each transaction, providing gas-efficient
temporary storage for use cases like reentrancy guards.

Example usage:
```solidity
contract MagicProtocol {
    using TransientLib for tuint256;

    error ReentrantCallDetected();

    struct ReentrancyLock {
        tuint256 counter;
    }

    ReentrancyLock private _lock;

    modifier nonReentrable {
        require(_lock.counter.inc() == 1, ReentrantCallDetected());
        _;
        _lock.counter.dec();
    }

    function someMagicFunction(...) external nonReentrable {
        ...
        target.callSomeSuspiciousFunction(...);
        ...
    }
}
```_

### Functions list
- [tload(self) internal](#tload)
- [tstore(self, value) internal](#tstore)
- [inc(self) internal](#inc)
- [inc(self, exception) internal](#inc)
- [unsafeInc(self) internal](#unsafeinc)
- [dec(self) internal](#dec)
- [dec(self, exception) internal](#dec)
- [unsafeDec(self) internal](#unsafedec)
- [initAndAdd(self, initialValue, toAdd) internal](#initandadd)
- [tload(self) internal](#tload)
- [tstore(self, value) internal](#tstore)
- [tload(self) internal](#tload)
- [tstore(self, value) internal](#tstore)

### Errors list
- [MathOverflow() ](#mathoverflow)
- [MathUnderflow() ](#mathunderflow)

### Functions
### tload

```solidity
function tload(struct tuint256 self) internal view returns (uint256 ret)
```

_Loads a uint256 value from transient storage._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct tuint256 | The transient uint256 storage slot. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
ret | uint256 | The value stored in transient storage. |

### tstore

```solidity
function tstore(struct tuint256 self, uint256 value) internal
```

_Stores a uint256 value to transient storage._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct tuint256 | The transient uint256 storage slot. |
| value | uint256 | The value to store. |

### inc

```solidity
function inc(struct tuint256 self) internal returns (uint256 incremented)
```

_Increments the transient uint256 value by 1 with overflow check.
Reverts with MathOverflow if the value would overflow._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct tuint256 | The transient uint256 storage slot. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
incremented | uint256 | The new value after incrementing. |

### inc

```solidity
function inc(struct tuint256 self, bytes4 exception) internal returns (uint256 incremented)
```

_Increments the transient uint256 value by 1 with custom overflow error._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct tuint256 | The transient uint256 storage slot. |
| exception | bytes4 | The error selector to revert with on overflow. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
incremented | uint256 | The new value after incrementing. |

### unsafeInc

```solidity
function unsafeInc(struct tuint256 self) internal returns (uint256 incremented)
```

_Increments the transient uint256 value by 1 without overflow check.
Warning: May overflow silently._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct tuint256 | The transient uint256 storage slot. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
incremented | uint256 | The new value after incrementing. |

### dec

```solidity
function dec(struct tuint256 self) internal returns (uint256 decremented)
```

_Decrements the transient uint256 value by 1 with underflow check.
Reverts with MathUnderflow if the value would underflow._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct tuint256 | The transient uint256 storage slot. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
decremented | uint256 | The new value after decrementing. |

### dec

```solidity
function dec(struct tuint256 self, bytes4 exception) internal returns (uint256 decremented)
```

_Decrements the transient uint256 value by 1 with custom underflow error._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct tuint256 | The transient uint256 storage slot. |
| exception | bytes4 | The error selector to revert with on underflow. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
decremented | uint256 | The new value after decrementing. |

### unsafeDec

```solidity
function unsafeDec(struct tuint256 self) internal returns (uint256 decremented)
```

_Decrements the transient uint256 value by 1 without underflow check.
Warning: May underflow silently._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct tuint256 | The transient uint256 storage slot. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
decremented | uint256 | The new value after decrementing. |

### initAndAdd

```solidity
function initAndAdd(struct tuint256 self, uint256 initialValue, uint256 toAdd) internal returns (uint256 result)
```

_Initializes with a value if zero, then adds to the transient uint256._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct tuint256 | The transient uint256 storage slot. |
| initialValue | uint256 | The value to use if current value is zero. |
| toAdd | uint256 | The value to add. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
result | uint256 | The final value after initialization and addition. |

### tload

```solidity
function tload(struct taddress self) internal view returns (address ret)
```

_Loads an address value from transient storage._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct taddress | The transient address storage slot. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
ret | address | The address stored in transient storage. |

### tstore

```solidity
function tstore(struct taddress self, address value) internal
```

_Stores an address value to transient storage._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct taddress | The transient address storage slot. |
| value | address | The address to store. |

### tload

```solidity
function tload(struct tbytes32 self) internal view returns (bytes32 ret)
```

_Loads a bytes32 value from transient storage._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct tbytes32 | The transient bytes32 storage slot. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
ret | bytes32 | The bytes32 value stored in transient storage. |

### tstore

```solidity
function tstore(struct tbytes32 self, bytes32 value) internal
```

_Stores a bytes32 value to transient storage._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct tbytes32 | The transient bytes32 storage slot. |
| value | bytes32 | The bytes32 value to store. |

### Errors
### MathOverflow

```solidity
error MathOverflow()
```

_Error thrown when increment would cause overflow._

### MathUnderflow

```solidity
error MathUnderflow()
```

_Error thrown when decrement would cause underflow._

