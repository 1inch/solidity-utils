
## BySigTraits

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

### deadline

```solidity
function deadline(BySigTraits.Value traits) internal pure returns (uint256)
```

### isRelayerAllowed

```solidity
function isRelayerAllowed(BySigTraits.Value traits, address relayer) internal pure returns (bool)
```

### nonce

```solidity
function nonce(BySigTraits.Value traits) internal pure returns (uint256)
```

### Errors
### WrongNonceType

```solidity
error WrongNonceType()
```

