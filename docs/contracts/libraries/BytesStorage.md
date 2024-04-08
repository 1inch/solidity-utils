
## BytesStorage

A library for operating on bytes storage slices.

### Types list
- [Slice](#slice)

### Functions list
- [wrap(data) internal](#wrap)
- [slice(data, offset, size) internal](#slice)
- [copy(piece) internal](#copy)

### Errors list
- [OutOfBounds() ](#outofbounds)

### Types
### Slice

_A struct representing a slice of bytes storage._

```solidity
struct Slice {
  uint256 slot;
  uint256 offset;
  uint256 length;
}
```

### Functions
### wrap

```solidity
function wrap(bytes data) internal view returns (struct BytesStorage.Slice)
```

_Wraps a bytes storage array into a `Slice`. For a detailed explanation,
     refer to https://ethereum.stackexchange.com/questions/107282/storage-and-memory-layout-of-strings/155800#155800_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | bytes | The bytes storage array to wrap. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | struct BytesStorage.Slice | A `Slice` struct that refers to the storage location and length of `data`. |

### slice

```solidity
function slice(struct BytesStorage.Slice data, uint256 offset, uint256 size) internal pure returns (struct BytesStorage.Slice)
```

_Returns a new `Slice` representing a portion of the original storage slice._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | struct BytesStorage.Slice | The original `Slice` to take a portion from. |
| offset | uint256 | The offset in bytes from the start of the original `Slice`. |
| size | uint256 | The size of the new `Slice` in bytes. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | struct BytesStorage.Slice | A new `Slice` struct representing the specified portion of the original. |

### copy

```solidity
function copy(struct BytesStorage.Slice piece) internal view returns (bytes ret)
```

_Copies a `Slice` from storage and returns it as a new bytes array._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| piece | struct BytesStorage.Slice | The `Slice` to copy from storage. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
ret | bytes | The new bytes array containing the copied data. |

### Errors
### OutOfBounds

```solidity
error OutOfBounds()
```

