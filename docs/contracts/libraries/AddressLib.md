
## Address

## AddressLib

AddressLib
Library for working with addresses encoded as uint256 values, which can include flags in the highest bits.

### Functions list
- [get(a) internal](#get)
- [getFlag(a, flag) internal](#getflag)
- [getUint32(a, offset) internal](#getuint32)
- [getUint64(a, offset) internal](#getuint64)

### Functions
### get

```solidity
function get(Address a) internal pure returns (address)
```
Returns the address representation of a uint256.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | Address | The uint256 value to convert to an address. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | address | The address representation of the provided uint256 value. |

### getFlag

```solidity
function getFlag(Address a, uint256 flag) internal pure returns (bool)
```
Checks if a given flag is set for the provided address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | Address | The address to check for the flag. |
| flag | uint256 | The flag to check for in the provided address. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | bool | True if the provided flag is set in the address, false otherwise. |

### getUint32

```solidity
function getUint32(Address a, uint256 offset) internal pure returns (uint32)
```
Returns a uint32 value stored at a specific bit offset in the provided address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | Address | The address containing the uint32 value. |
| offset | uint256 | The bit offset at which the uint32 value is stored. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | uint32 | The uint32 value stored in the address at the specified bit offset. |

### getUint64

```solidity
function getUint64(Address a, uint256 offset) internal pure returns (uint64)
```
Returns a uint64 value stored at a specific bit offset in the provided address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | Address | The address containing the uint64 value. |
| offset | uint256 | The bit offset at which the uint64 value is stored. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | uint64 | The uint64 value stored in the address at the specified bit offset. |

