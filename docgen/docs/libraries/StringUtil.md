# StringUtil


StringUtil


Library with gas-efficient string operations.


## Functions
### toHex
```solidity
function toHex(
  uint256 value
) internal returns (string)
```
Converts a uint256 value to its hexadecimal string representation.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`value` | uint256 | The uint256 value to convert.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`The`| string | hexadecimal string representation of the input value.

### toHex
```solidity
function toHex(
  address value
) internal returns (string)
```
Converts an address to its hexadecimal string representation.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`value` | address | The address to convert.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`The`| string | hexadecimal string representation of the input address.

### toHex
```solidity
function toHex(
  bytes data
) internal returns (string result)
```

Converts arbitrary bytes to their hexadecimal string representation.
This is an assembly adaptation of highly optimized toHex16 code by Mikhail Vladimirov.
Reference: https://stackoverflow.com/a/69266989

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`data` | bytes | The bytes to be converted to hexadecimal string.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`result`| string | The hexadecimal string representation of the input bytes.

