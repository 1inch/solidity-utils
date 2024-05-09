
## AddressSet

Library for managing sets of addresses, allowing operations such as add, remove, and contains.
Utilizes the AddressArray library for underlying data storage.

### Types list
- [Data](#data)

### Functions list
- [length(s) internal](#length)
- [at(s, index) internal](#at)
- [unsafeAt(s, index) internal](#unsafeat)
- [contains(s, item) internal](#contains)
- [get(s) internal](#get)
- [get(s, input) internal](#get)
- [add(s, item) internal](#add)
- [remove(s, item) internal](#remove)
- [erase(s) internal](#erase)

### Types
### Data

_Data struct from AddressArray.Data items
and lookup mapping address => index in data array._

```solidity
struct Data {
  struct AddressArray.Data items;
  mapping(address => uint256) lookup;
}
```

### Functions
### length

```solidity
function length(struct AddressSet.Data s) internal view returns (uint256)
```
Determines the number of addresses in the set.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| s | struct AddressSet.Data | The set of addresses. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | uint256 | The number of addresses in the set. |

### at

```solidity
function at(struct AddressSet.Data s, uint256 index) internal view returns (address)
```
Retrieves the address at a specified index in the set. Reverts if the index is out of bounds.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| s | struct AddressSet.Data | The set of addresses. |
| index | uint256 | The index of the address to retrieve. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | address | The address at the specified index. |

### unsafeAt

```solidity
function unsafeAt(struct AddressSet.Data s, uint256 index) internal view returns (address)
```
Retrieves the address at a specified index in the set without bounds checking.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| s | struct AddressSet.Data | The set of addresses. |
| index | uint256 | The index of the address to retrieve. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | address | The address at the specified index. |

### contains

```solidity
function contains(struct AddressSet.Data s, address item) internal view returns (bool)
```
Checks if the set contains the specified address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| s | struct AddressSet.Data | The set of addresses. |
| item | address | The address to check for. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | bool | True if the set contains the address, false otherwise. |

### get

```solidity
function get(struct AddressSet.Data s) internal view returns (address[])
```
Returns list of addresses from storage `s`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| s | struct AddressSet.Data | The set of addresses. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | address[] | The array of addresses stored in `s`. |

### get

```solidity
function get(struct AddressSet.Data s, address[] input) internal view returns (address[])
```
Puts list of addresses from `s` storage into `output` array.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| s | struct AddressSet.Data | The set of addresses. |
| input | address[] |  |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | address[] | The provided output array filled with addresses. |

### add

```solidity
function add(struct AddressSet.Data s, address item) internal returns (bool)
```
Adds an address to the set if it is not already present.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| s | struct AddressSet.Data | The set of addresses. |
| item | address | The address to add. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | bool | True if the address was added to the set, false if it was already present. |

### remove

```solidity
function remove(struct AddressSet.Data s, address item) internal returns (bool)
```
Removes an address from the set if it exists.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| s | struct AddressSet.Data | The set of addresses. |
| item | address | The address to remove. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | bool | True if the address was removed from the set, false if it was not found. |

### erase

```solidity
function erase(struct AddressSet.Data s) internal returns (address[] items)
```
Erases set from storage `s`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| s | struct AddressSet.Data | The set of addresses. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
items | address[] | All removed items. |

