
## BySigTraits

Provides utility functions for decoding and working with `BySig` call traits encoded in a single `uint256` value.

_This library allows for the compact representation and manipulation of various call traits such as nonce type,
deadline, relayer allowance, and nonce value using bit manipulation techniques._

### Types list
- [Value](#value)
- [NonceType](#noncetype)

### Functions list
- [nonceType(traits) internal](#noncetype)
- [deadline(traits) internal](#deadline)
- [isRelayerAllowed(traits, relayer) internal](#isrelayerallowed)
- [nonce(traits) internal](#nonce)

### Errors list
- [WrongNonceType() ](#wrongnoncetype)

### Types
### Value

### NonceType

```solidity
enum NonceType {
  Account,
  Selector,
  Unique
}
```

### Functions
### nonceType

```solidity
function nonceType(BySigTraits.Value traits) internal pure returns (enum BySigTraits.NonceType)
```
Decodes and returns the nonce type from the traits.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| traits | BySigTraits.Value | The encoded call traits. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | enum BySigTraits.NonceType | The decoded nonce type as an enum. |

### deadline

```solidity
function deadline(BySigTraits.Value traits) internal pure returns (uint256)
```
Decodes and returns the deadline from the traits.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| traits | BySigTraits.Value | The encoded call traits. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | uint256 | The decoded deadline timestamp. |

### isRelayerAllowed

```solidity
function isRelayerAllowed(BySigTraits.Value traits, address relayer) internal pure returns (bool)
```
Checks if a given relayer address is allowed to relay the call based on the traits.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| traits | BySigTraits.Value | The encoded call traits. |
| relayer | address | The address of the relayer to check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | bool | True if the relayer is allowed, false otherwise. |

### nonce

```solidity
function nonce(BySigTraits.Value traits) internal pure returns (uint256)
```
Decodes and returns the nonce value from the traits.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| traits | BySigTraits.Value | The encoded call traits. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | uint256 | The decoded nonce value. |

### Errors
### WrongNonceType

```solidity
error WrongNonceType()
```
Thrown when an invalid nonce type is encountered.

