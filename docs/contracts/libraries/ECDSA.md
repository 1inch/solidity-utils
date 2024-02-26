# ECDSA


ECDSA signature operations

Provides functions for recovering addresses from signatures and verifying signatures, including support for EIP-2098 compact signatures.



## Functions
### recover
```solidity
function recover(
  bytes32 hash,
  uint8 v,
  bytes32 r,
  bytes32 s
) internal returns (address signer)
```
Recovers the signer's address from the signature.

Recovers the address that has signed a hash with `(v, r, s)` signature.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`hash` | bytes32 | The keccak256 hash of the data signed.  
|`v` | uint8 | The recovery byte of the signature.  
|`r` | bytes32 | The first 32 bytes of the signature.  
|`s` | bytes32 | The second 32 bytes of the signature.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`signer`| address | The address of the signer.

### recover
```solidity
function recover(
  bytes32 hash,
  bytes32 r,
  bytes32 vs
) internal returns (address signer)
```
Recovers the signer's address from the signature using `r` and `vs` components.

Recovers the address that has signed a hash with `r` and `vs`, where `vs` combines `v` and `s`.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`hash` | bytes32 | The keccak256 hash of the data signed.  
|`r` | bytes32 | The first 32 bytes of the signature.  
|`vs` | bytes32 | The combined `v` and `s` values of the signature.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`signer`| address | The address of the signer.

### recover
```solidity
function recover(
  bytes32 hash,
  bytes signature
) internal returns (address signer)
```

WARNING!!!
There is a known signature malleability issue with two representations of signatures!
Even though this function is able to verify both standard 65-byte and compact 64-byte EIP-2098 signatures
one should never use raw signatures for any kind of invalidation logic in their code.
As the standard and compact representations are interchangeable any invalidation logic that relies on
signature uniqueness will get rekt.
More info: https://github.com/OpenZeppelin/openzeppelin-contracts/security/advisories/GHSA-4h98-2769-gh6h
#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`hash` | bytes32 | 
|`signature` | bytes | 


### recoverOrIsValidSignature
```solidity
function recoverOrIsValidSignature(
  address signer,
  bytes32 hash,
  bytes signature
) internal returns (bool success)
```
Verifies the signature for a hash, either by recovering the signer or using EIP-1271's `isValidSignature` function.

Attempts to recover the signer's address from the signature; if the address is non-zero, checks if it's valid according to EIP-1271.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`signer` | address | The address to validate the signature against.  
|`hash` | bytes32 | The hash of the signed data.  
|`signature` | bytes | The signature to verify.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`success`| bool | True if the signature is verified, false otherwise.

### recoverOrIsValidSignature
```solidity
function recoverOrIsValidSignature(
  address signer,
  bytes32 hash,
  uint8 v,
  bytes32 r,
  bytes32 s
) internal returns (bool success)
```
Verifies the signature for a hash, either by recovering the signer or using EIP-1271's `isValidSignature` function.

Attempts to recover the signer's address from the signature; if the address is non-zero, checks if it's valid according to EIP-1271.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`signer` | address | The address to validate the signature against.  
|`hash` | bytes32 | The hash of the signed data.  
|`v` | uint8 | The recovery byte of the signature.  
|`r` | bytes32 | The first 32 bytes of the signature.  
|`s` | bytes32 | The second 32 bytes of the signature.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`success`| bool | True if the signature is verified, false otherwise.

### recoverOrIsValidSignature
```solidity
function recoverOrIsValidSignature(
  address signer,
  bytes32 hash,
  bytes32 r,
  bytes32 vs
) internal returns (bool success)
```
Verifies the signature for a hash, either by recovering the signer or using EIP-1271's `isValidSignature` function.

Attempts to recover the signer's address from the signature; if the address is non-zero, checks if it's valid according to EIP-1271.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`signer` | address | The address to validate the signature against.  
|`hash` | bytes32 | The hash of the signed data.  
|`r` | bytes32 | The first 32 bytes of the signature.  
|`vs` | bytes32 | The combined `v` and `s` values of the signature.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`success`| bool | True if the signature is verified, false otherwise.

### recoverOrIsValidSignature65
```solidity
function recoverOrIsValidSignature65(
  address signer,
  bytes32 hash,
  bytes32 r,
  bytes32 vs
) internal returns (bool success)
```
Verifies the signature for a given hash, attempting to recover the signer's address or validates it using EIP-1271 for 65-byte signatures.

Attempts to recover the signer's address from the signature. If the address is a contract, checks if the signature is valid according to EIP-1271.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`signer` | address | The expected signer's address.  
|`hash` | bytes32 | The keccak256 hash of the signed data.  
|`r` | bytes32 | The first 32 bytes of the signature.  
|`vs` | bytes32 | The last 32 bytes of the signature, with the last byte being the recovery id.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`success`| bool | True if the signature is valid, false otherwise.

### isValidSignature
```solidity
function isValidSignature(
  address signer,
  bytes32 hash,
  bytes signature
) internal returns (bool success)
```
Validates a signature for a hash using EIP-1271, if `signer` is a contract.

Makes a static call to `signer` with `isValidSignature` function selector from EIP-1271.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`signer` | address | The address of the signer to validate against, which could be an EOA or a contract.  
|`hash` | bytes32 | The hash of the signed data.  
|`signature` | bytes | The signature to validate.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`success`| bool | True if the signature is valid according to EIP-1271, false otherwise.

### isValidSignature
```solidity
function isValidSignature(
  address signer,
  bytes32 hash,
  uint8 v,
  bytes32 r,
  bytes32 s
) internal returns (bool success)
```
Validates a signature for a hash using EIP-1271, if `signer` is a contract.

Makes a static call to `signer` with `isValidSignature` function selector from EIP-1271.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`signer` | address | The address of the signer to validate against, which could be an EOA or a contract.  
|`hash` | bytes32 | The hash of the signed data.  
|`v` | uint8 | The recovery byte of the signature.  
|`r` | bytes32 | The first 32 bytes of the signature.  
|`s` | bytes32 | The second 32 bytes of the signature.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`success`| bool | True if the signature is valid according to EIP-1271, false otherwise.

### isValidSignature
```solidity
function isValidSignature(
  address signer,
  bytes32 hash,
  bytes32 r,
  bytes32 vs
) internal returns (bool success)
```
Validates a signature for a hash using EIP-1271, if `signer` is a contract.

Makes a static call to `signer` with `isValidSignature` function selector from EIP-1271.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`signer` | address | The address of the signer to validate against, which could be an EOA or a contract.  
|`hash` | bytes32 | The hash of the signed data.  
|`r` | bytes32 | The first 32 bytes of the signature.  
|`vs` | bytes32 | The last 32 bytes of the signature, with the last byte being the recovery id.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`success`| bool | True if the signature is valid according to EIP-1271, false otherwise.

### isValidSignature65
```solidity
function isValidSignature65(
  address signer,
  bytes32 hash,
  bytes32 r,
  bytes32 vs
) internal returns (bool success)
```
Verifies if a 65-byte signature is valid for a given hash, according to EIP-1271.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`signer` | address | The address of the signer to validate against, which could be an EOA or a contract.  
|`hash` | bytes32 | The hash of the signed data.  
|`r` | bytes32 | The first 32 bytes of the signature.  
|`vs` | bytes32 | The combined `v` (recovery id) and `s` component of the signature, packed into the last 32 bytes.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`success`| bool | True if the signature is valid according to EIP-1271, false otherwise.

### toEthSignedMessageHash
```solidity
function toEthSignedMessageHash(
  bytes32 hash
) internal returns (bytes32 res)
```
Generates a hash compatible with Ethereum's signed message format.

Prepends the hash with Ethereum's message prefix before hashing it.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`hash` | bytes32 | The hash of the data to sign.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`res`| bytes32 | The Ethereum signed message hash.

### toTypedDataHash
```solidity
function toTypedDataHash(
  bytes32 domainSeparator,
  bytes32 structHash
) internal returns (bytes32 res)
```
Generates an EIP-712 compliant hash.

Encodes the domain separator and the struct hash according to EIP-712.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`domainSeparator` | bytes32 | The EIP-712 domain separator.  
|`structHash` | bytes32 | The EIP-712 struct hash.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`res`| bytes32 | The EIP-712 compliant hash.

