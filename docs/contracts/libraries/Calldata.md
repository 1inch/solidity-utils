
## Calldata

_Library for efficient slicing of calldata byte arrays without memory copying.
Provides gas-optimized operations for extracting portions of calldata directly._

### Functions list
- [slice(calls, begin, end) internal](#slice)
- [slice(calls, begin, end, exception) internal](#slice)
- [slice(calls, begin) internal](#slice)
- [slice(calls, begin, exception) internal](#slice)

### Functions
### slice

```solidity
function slice(bytes calls, uint256 begin, uint256 end) internal pure returns (bytes res)
```

_Returns a slice of the calldata bytes from `begin` to `end` index.
Warning: Does not perform bounds checking for gas efficiency._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| calls | bytes | The calldata bytes to slice. |
| begin | uint256 | The starting index of the slice. |
| end | uint256 | The ending index of the slice (exclusive). |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
res | bytes | The sliced calldata bytes. |

### slice

```solidity
function slice(bytes calls, uint256 begin, uint256 end, bytes4 exception) internal pure returns (bytes res)
```

_Returns a slice of the calldata bytes from `begin` to `end` index with bounds checking.
Reverts with the provided exception selector if `end` exceeds the calldata length._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| calls | bytes | The calldata bytes to slice. |
| begin | uint256 | The starting index of the slice. |
| end | uint256 | The ending index of the slice (exclusive). |
| exception | bytes4 | The error selector to revert with if bounds check fails. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
res | bytes | The sliced calldata bytes. |

### slice

```solidity
function slice(bytes calls, uint256 begin) internal pure returns (bytes res)
```

_Returns a slice of the calldata bytes from `begin` index to the end.
Warning: Does not perform bounds checking for gas efficiency._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| calls | bytes | The calldata bytes to slice. |
| begin | uint256 | The starting index of the slice. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
res | bytes | The sliced calldata bytes from begin to the end. |

### slice

```solidity
function slice(bytes calls, uint256 begin, bytes4 exception) internal pure returns (bytes res)
```

_Returns a slice of the calldata bytes from `begin` index to the end with bounds checking.
Reverts with the provided exception selector if `begin` exceeds the calldata length._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| calls | bytes | The calldata bytes to slice. |
| begin | uint256 | The starting index of the slice. |
| exception | bytes4 | The error selector to revert with if bounds check fails. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
res | bytes | The sliced calldata bytes from begin to the end. |

