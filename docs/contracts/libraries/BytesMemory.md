
## BytesMemory

A library for operating on bytes memory slices without copying.

### Types list
- [Slice](#slice)

### Functions list
- [wrap(data) internal](#wrap)
- [slice(data, offset, size) internal](#slice)
- [unwrap(piece) internal](#unwrap)

### Errors list
- [OutOfBounds() ](#outofbounds)

### Types
### Slice

_A struct representing a slice of bytes.
This points directly to memory without copying the slice._

```solidity
struct Slice {
  uint256 pointer;
  uint256 length;
}
```

### Functions
### wrap

```solidity
function wrap(bytes data) internal pure returns (struct BytesMemory.Slice ret)
```

_Creates a `Slice` from a bytes array._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | bytes | The bytes array to create a slice from. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
ret | struct BytesMemory.Slice | A `Slice` struct representing the entire bytes array. |

### slice

```solidity
function slice(struct BytesMemory.Slice data, uint256 offset, uint256 size) internal pure returns (struct BytesMemory.Slice ret)
```

_Returns a new `Slice` representing a portion of the original._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | struct BytesMemory.Slice | The original `Slice` to take a portion from. |
| offset | uint256 | The offset in bytes from the start of the original `Slice`. |
| size | uint256 | The size of the new `Slice` in bytes. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
ret | struct BytesMemory.Slice | A new `Slice` struct representing the specified portion of the original. |

### unwrap

```solidity
function unwrap(struct BytesMemory.Slice piece) internal view returns (bytes ret)
```

_Converts a `Slice` back into a bytes array. The bytes array is returned without copying the data._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| piece | struct BytesMemory.Slice | The `Slice` to convert back to a bytes array. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
ret | bytes | The bytes array represented by the `Slice`. |

### Errors
### OutOfBounds

```solidity
error OutOfBounds()
```

