# AddressArray


AddressArray

Implements a dynamic array of addresses using a mapping for storage efficiency, with the array length stored at index 0.

This library provides basic functionalities such as push, pop, set, and retrieval of addresses in a storage-efficient manner.


## Functions
### length
```solidity
function length(
  struct AddressArray.Data self
) internal returns (uint256)
```
Returns the number of addresses stored in the array.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct AddressArray.Data | The instance of the Data struct.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`The`| uint256 | number of addresses.

### at
```solidity
function at(
  struct AddressArray.Data self,
  uint256 i
) internal returns (address)
```
Retrieves the address at a specified index in the array.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct AddressArray.Data | The instance of the Data struct.  
|`i` | uint256 | The index to retrieve the address from.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`The`| address | address stored at the specified index.

### get
```solidity
function get(
  struct AddressArray.Data self
) internal returns (address[] output)
```
Returns all addresses in the array from storage.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct AddressArray.Data | The instance of the Data struct.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`output`| address[] | Array containing all the addresses.

### get
```solidity
function get(
  struct AddressArray.Data self,
  address[] input
) internal returns (address[] output)
```
Copies the addresses into the provided output array.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct AddressArray.Data | The instance of the Data struct.  
|`input` | address[] | The array to copy the addresses into.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`output`| address[] | The provided output array filled with addresses.

### push
```solidity
function push(
  struct AddressArray.Data self,
  address account
) internal returns (uint256 res)
```
Adds an address to the end of the array.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct AddressArray.Data | The instance of the Data struct.  
|`account` | address | The address to add.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`res`| uint256 | The new length of the array.

### pop
```solidity
function pop(
  struct AddressArray.Data self
) internal
```
Removes the last address from the array.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct AddressArray.Data | The instance of the Data struct. 


### popGet
```solidity
function popGet(
  struct AddressArray.Data self
) internal returns (address res)
```
Array pop back operation for storage `self` that returns popped element.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct AddressArray.Data | The instance of the Data struct.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`res`| address | The address that was removed from the array.

### set
```solidity
function set(
  struct AddressArray.Data self,
  uint256 index,
  address account
) internal
```
Sets the address at a specified index in the array.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct AddressArray.Data | The instance of the Data struct.  
|`index` | uint256 | The index at which to set the address.  
|`account` | address | The address to set at the specified index. 


### erase
```solidity
function erase(
  struct AddressArray.Data self
) internal
```
Erase length of the array.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`self` | struct AddressArray.Data | The instance of the Data struct. 


