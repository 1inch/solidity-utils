
## ECDSA

Provides functions for recovering addresses from signatures and verifying signatures, including support for EIP-2098 compact signatures.

### Functions list
- [recover(hash, v, r, s) internal](#recover)
- [recover(hash, r, vs) internal](#recover)
- [recover(hash, signature) internal](#recover)
- [recoverOrIsValidSignature(signer, hash, signature) internal](#recoverorisvalidsignature)
- [recoverOrIsValidSignature(signer, hash, v, r, s) internal](#recoverorisvalidsignature)
- [recoverOrIsValidSignature(signer, hash, r, vs) internal](#recoverorisvalidsignature)
- [recoverOrIsValidSignature65(signer, hash, r, vs) internal](#recoverorisvalidsignature65)
- [isValidSignature(signer, hash, signature) internal](#isvalidsignature)
- [isValidSignature(signer, hash, v, r, s) internal](#isvalidsignature)
- [isValidSignature(signer, hash, r, vs) internal](#isvalidsignature)
- [isValidSignature65(signer, hash, r, vs) internal](#isvalidsignature65)
- [toEthSignedMessageHash(hash) internal](#toethsignedmessagehash)
- [toTypedDataHash(domainSeparator, structHash) internal](#totypeddatahash)

### Functions
### recover

```solidity
function recover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal view returns (address signer)
```
Recovers the signer's address from the signature.

_Recovers the address that has signed a hash with `(v, r, s)` signature._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| hash | bytes32 | The keccak256 hash of the data signed. |
| v | uint8 | The recovery byte of the signature. |
| r | bytes32 | The first 32 bytes of the signature. |
| s | bytes32 | The second 32 bytes of the signature. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
signer | address | The address of the signer. |

### recover

```solidity
function recover(bytes32 hash, bytes32 r, bytes32 vs) internal view returns (address signer)
```
Recovers the signer's address from the signature using `r` and `vs` components.

_Recovers the address that has signed a hash with `r` and `vs`, where `vs` combines `v` and `s`._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| hash | bytes32 | The keccak256 hash of the data signed. |
| r | bytes32 | The first 32 bytes of the signature. |
| vs | bytes32 | The combined `v` and `s` values of the signature. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
signer | address | The address of the signer. |

### recover

```solidity
function recover(bytes32 hash, bytes signature) internal view returns (address signer)
```

_WARNING!!!
There is a known signature malleability issue with two representations of signatures!
Even though this function is able to verify both standard 65-byte and compact 64-byte EIP-2098 signatures
one should never use raw signatures for any kind of invalidation logic in their code.
As the standard and compact representations are interchangeable any invalidation logic that relies on
signature uniqueness will get rekt.
More info: https://github.com/OpenZeppelin/openzeppelin-contracts/security/advisories/GHSA-4h98-2769-gh6h_

### recoverOrIsValidSignature

```solidity
function recoverOrIsValidSignature(address signer, bytes32 hash, bytes signature) internal view returns (bool success)
```
Verifies the signature for a hash, either by recovering the signer or using EIP-1271's `isValidSignature` function.

_Attempts to recover the signer's address from the signature; if the address is non-zero, checks if it's valid according to EIP-1271._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| signer | address | The address to validate the signature against. |
| hash | bytes32 | The hash of the signed data. |
| signature | bytes | The signature to verify. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
success | bool | True if the signature is verified, false otherwise. |

### recoverOrIsValidSignature

```solidity
function recoverOrIsValidSignature(address signer, bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal view returns (bool success)
```
Verifies the signature for a hash, either by recovering the signer or using EIP-1271's `isValidSignature` function.

_Attempts to recover the signer's address from the signature; if the address is non-zero, checks if it's valid according to EIP-1271._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| signer | address | The address to validate the signature against. |
| hash | bytes32 | The hash of the signed data. |
| v | uint8 | The recovery byte of the signature. |
| r | bytes32 | The first 32 bytes of the signature. |
| s | bytes32 | The second 32 bytes of the signature. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
success | bool | True if the signature is verified, false otherwise. |

### recoverOrIsValidSignature

```solidity
function recoverOrIsValidSignature(address signer, bytes32 hash, bytes32 r, bytes32 vs) internal view returns (bool success)
```
Verifies the signature for a hash, either by recovering the signer or using EIP-1271's `isValidSignature` function.

_Attempts to recover the signer's address from the signature; if the address is non-zero, checks if it's valid according to EIP-1271._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| signer | address | The address to validate the signature against. |
| hash | bytes32 | The hash of the signed data. |
| r | bytes32 | The first 32 bytes of the signature. |
| vs | bytes32 | The combined `v` and `s` values of the signature. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
success | bool | True if the signature is verified, false otherwise. |

### recoverOrIsValidSignature65

```solidity
function recoverOrIsValidSignature65(address signer, bytes32 hash, bytes32 r, bytes32 vs) internal view returns (bool success)
```
Verifies the signature for a given hash, attempting to recover the signer's address or validates it using EIP-1271 for 65-byte signatures.

_Attempts to recover the signer's address from the signature. If the address is a contract, checks if the signature is valid according to EIP-1271._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| signer | address | The expected signer's address. |
| hash | bytes32 | The keccak256 hash of the signed data. |
| r | bytes32 | The first 32 bytes of the signature. |
| vs | bytes32 | The last 32 bytes of the signature, with the last byte being the recovery id. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
success | bool | True if the signature is valid, false otherwise. |

### isValidSignature

```solidity
function isValidSignature(address signer, bytes32 hash, bytes signature) internal view returns (bool success)
```
Validates a signature for a hash using EIP-1271, if `signer` is a contract.

_Makes a static call to `signer` with `isValidSignature` function selector from EIP-1271._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| signer | address | The address of the signer to validate against, which could be an EOA or a contract. |
| hash | bytes32 | The hash of the signed data. |
| signature | bytes | The signature to validate. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
success | bool | True if the signature is valid according to EIP-1271, false otherwise. |

### isValidSignature

```solidity
function isValidSignature(address signer, bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal view returns (bool success)
```
Validates a signature for a hash using EIP-1271, if `signer` is a contract.

_Makes a static call to `signer` with `isValidSignature` function selector from EIP-1271._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| signer | address | The address of the signer to validate against, which could be an EOA or a contract. |
| hash | bytes32 | The hash of the signed data. |
| v | uint8 | The recovery byte of the signature. |
| r | bytes32 | The first 32 bytes of the signature. |
| s | bytes32 | The second 32 bytes of the signature. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
success | bool | True if the signature is valid according to EIP-1271, false otherwise. |

### isValidSignature

```solidity
function isValidSignature(address signer, bytes32 hash, bytes32 r, bytes32 vs) internal view returns (bool success)
```
Validates a signature for a hash using EIP-1271, if `signer` is a contract.

_Makes a static call to `signer` with `isValidSignature` function selector from EIP-1271._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| signer | address | The address of the signer to validate against, which could be an EOA or a contract. |
| hash | bytes32 | The hash of the signed data. |
| r | bytes32 | The first 32 bytes of the signature. |
| vs | bytes32 | The last 32 bytes of the signature, with the last byte being the recovery id. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
success | bool | True if the signature is valid according to EIP-1271, false otherwise. |

### isValidSignature65

```solidity
function isValidSignature65(address signer, bytes32 hash, bytes32 r, bytes32 vs) internal view returns (bool success)
```
Verifies if a 65-byte signature is valid for a given hash, according to EIP-1271.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| signer | address | The address of the signer to validate against, which could be an EOA or a contract. |
| hash | bytes32 | The hash of the signed data. |
| r | bytes32 | The first 32 bytes of the signature. |
| vs | bytes32 | The combined `v` (recovery id) and `s` component of the signature, packed into the last 32 bytes. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
success | bool | True if the signature is valid according to EIP-1271, false otherwise. |

### toEthSignedMessageHash

```solidity
function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32 res)
```
Generates a hash compatible with Ethereum's signed message format.

_Prepends the hash with Ethereum's message prefix before hashing it._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| hash | bytes32 | The hash of the data to sign. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
res | bytes32 | The Ethereum signed message hash. |

### toTypedDataHash

```solidity
function toTypedDataHash(bytes32 domainSeparator, bytes32 structHash) internal pure returns (bytes32 res)
```
Generates an EIP-712 compliant hash.

_Encodes the domain separator and the struct hash according to EIP-712._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| domainSeparator | bytes32 | The EIP-712 domain separator. |
| structHash | bytes32 | The EIP-712 struct hash. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
res | bytes32 | The EIP-712 compliant hash. |

