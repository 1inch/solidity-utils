# BySigTraits


BySigTraits

Provides utility functions for decoding and working with `BySig` call traits encoded in a single `uint256` value.

This library allows for the compact representation and manipulation of various call traits such as nonce type,
deadline, relayer allowance, and nonce value using bit manipulation techniques.


## Functions
### nonceType
```solidity
function nonceType(
  BySigTraits.Value traits
) internal returns (enum BySigTraits.NonceType)
```
Decodes and returns the nonce type from the traits.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`traits` | BySigTraits.Value | The encoded call traits.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`The`| enum BySigTraits.NonceType | decoded nonce type as an enum.

### deadline
```solidity
function deadline(
  BySigTraits.Value traits
) internal returns (uint256)
```
Decodes and returns the deadline from the traits.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`traits` | BySigTraits.Value | The encoded call traits.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`The`| uint256 | decoded deadline timestamp.

### isRelayerAllowed
```solidity
function isRelayerAllowed(
  BySigTraits.Value traits,
  address relayer
) internal returns (bool)
```
Checks if a given relayer address is allowed to relay the call based on the traits.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`traits` | BySigTraits.Value | The encoded call traits.  
|`relayer` | address | The address of the relayer to check.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`True`| bool | if the relayer is allowed, false otherwise.

### nonce
```solidity
function nonce(
  BySigTraits.Value traits
) internal returns (uint256)
```
Decodes and returns the nonce value from the traits.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`traits` | BySigTraits.Value | The encoded call traits.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`The`| uint256 | decoded nonce value.

