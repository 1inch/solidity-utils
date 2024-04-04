
## StringUtil

_Library with gas-efficient string operations._

### Functions list
- [toHex(value) internal](#tohex)
- [toHex(value) internal](#tohex)
- [toHex(data) internal](#tohex)

### Functions
### toHex

```solidity
function toHex(uint256 value) internal pure returns (string)
```
Converts a uint256 value to its hexadecimal string representation.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The uint256 value to convert. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | string | The hexadecimal string representation of the input value. |

### toHex

```solidity
function toHex(address value) internal pure returns (string)
```
Converts an address to its hexadecimal string representation.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | address | The address to convert. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | string | The hexadecimal string representation of the input address. |

### toHex

```solidity
function toHex(bytes data) internal pure returns (string result)
```

_Converts arbitrary bytes to their hexadecimal string representation.
This is an assembly adaptation of highly optimized toHex16 code by Mikhail Vladimirov.
Reference: https://stackoverflow.com/a/69266989_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | bytes | The bytes to be converted to hexadecimal string. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
result | string | The hexadecimal string representation of the input bytes. |

