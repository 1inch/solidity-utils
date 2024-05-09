
## AddressArray

Implements a dynamic array of addresses using a mapping for storage efficiency, with the array length stored at index 0.

_This library provides basic functionalities such as push, pop, set, and retrieval of addresses in a storage-efficient manner._

### Types list
- [Data](#data)

### Functions list
- [length(self) internal](#length)
- [at(self, i) internal](#at)
- [unsafeAt(self, i) internal](#unsafeat)
- [get(self) internal](#get)
- [get(self, input) internal](#get)
- [push(self, account) internal](#push)
- [pop(self) internal](#pop)
- [popGet(self) internal](#popget)
- [set(self, index, account) internal](#set)
- [erase(self) internal](#erase)

### Errors list
- [IndexOutOfBounds() ](#indexoutofbounds)
- [PopFromEmptyArray() ](#popfromemptyarray)
- [OutputArrayTooSmall() ](#outputarraytoosmall)

### Types
### Data

_Struct containing the raw mapping used to store the addresses and the array length._

```solidity
struct Data {
  uint256[4294967296] _raw;
}
```

### Functions
### length

```solidity
function length(struct AddressArray.Data self) internal view returns (uint256)
```
Returns the number of addresses stored in the array.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct AddressArray.Data | The instance of the Data struct. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | uint256 | The number of addresses. |

### at

```solidity
function at(struct AddressArray.Data self, uint256 i) internal view returns (address)
```
Retrieves the address at a specified index in the array. Reverts if the index is out of bounds.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct AddressArray.Data | The instance of the Data struct. |
| i | uint256 | The index to retrieve the address from. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | address | The address stored at the specified index. |

### unsafeAt

```solidity
function unsafeAt(struct AddressArray.Data self, uint256 i) internal view returns (address)
```
Retrieves the address at a specified index in the array without bounds checking.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct AddressArray.Data | The instance of the Data struct. |
| i | uint256 | The index to retrieve the address from. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | address | The address stored at the specified index. |

### get

```solidity
function get(struct AddressArray.Data self) internal view returns (address[] output)
```
Returns all addresses in the array from storage.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct AddressArray.Data | The instance of the Data struct. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
output | address[] | Array containing all the addresses. |

### get

```solidity
function get(struct AddressArray.Data self, address[] input) internal view returns (address[] output)
```
Copies the addresses into the provided output array.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct AddressArray.Data | The instance of the Data struct. |
| input | address[] | The array to copy the addresses into. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
output | address[] | The provided output array filled with addresses. |

### push

```solidity
function push(struct AddressArray.Data self, address account) internal returns (uint256 res)
```
Adds an address to the end of the array.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct AddressArray.Data | The instance of the Data struct. |
| account | address | The address to add. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
res | uint256 | The new length of the array. |

### pop

```solidity
function pop(struct AddressArray.Data self) internal
```
Removes the last address from the array.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct AddressArray.Data | The instance of the Data struct. |

### popGet

```solidity
function popGet(struct AddressArray.Data self) internal returns (address res)
```
Array pop back operation for storage `self` that returns popped element.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct AddressArray.Data | The instance of the Data struct. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
res | address | The address that was removed from the array. |

### set

```solidity
function set(struct AddressArray.Data self, uint256 index, address account) internal
```
Sets the address at a specified index in the array.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct AddressArray.Data | The instance of the Data struct. |
| index | uint256 | The index at which to set the address. |
| account | address | The address to set at the specified index. |

### erase

```solidity
function erase(struct AddressArray.Data self) internal
```
Erase length of the array.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| self | struct AddressArray.Data | The instance of the Data struct. |

### Errors
### IndexOutOfBounds

```solidity
error IndexOutOfBounds()
```

_Error thrown when attempting to access an index outside the bounds of the array._

### PopFromEmptyArray

```solidity
error PopFromEmptyArray()
```

_Error thrown when attempting to pop an element from an empty array._

### OutputArrayTooSmall

```solidity
error OutputArrayTooSmall()
```

_Error thrown when the output array provided for getting the list of addresses is too small._

