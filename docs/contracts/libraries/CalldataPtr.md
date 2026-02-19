
## CalldataPtr

## CalldataPtrLib

_Library for working with CalldataPtr type, providing conversion functions
between calldata bytes and the packed pointer representation._

### Functions list
- [from(data) internal](#from)
- [toBytes(ptr) internal](#tobytes)

### Functions
### from

```solidity
function from(bytes data) internal pure returns (CalldataPtr ptr)
```

_Creates a CalldataPtr from calldata bytes by packing offset and length._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | bytes | The calldata bytes to create a pointer from. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
ptr | CalldataPtr | The packed CalldataPtr containing offset in upper 128 bits and length in lower 128 bits. |

### toBytes

```solidity
function toBytes(CalldataPtr ptr) internal pure returns (bytes data)
```

_Converts a CalldataPtr back to calldata bytes by unpacking offset and length._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ptr | CalldataPtr | The CalldataPtr to convert. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
data | bytes | The calldata bytes referenced by the pointer. |

