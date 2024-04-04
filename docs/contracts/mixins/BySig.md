
## BySig

_Inherit your contract from this mixin and use `_msgSender()` instead of `msg.sender` everywhere._

### Types list
- [SignedCall](#signedcall)

### Functions list
- [bySigAccountNonces(account) public](#bysigaccountnonces)
- [bySigSelectorNonces(account, selector) public](#bysigselectornonces)
- [bySigUniqueNonces(account, nonce) public](#bysiguniquenonces)
- [bySigUniqueNoncesSlot(account, nonce) public](#bysiguniquenoncesslot)
- [hashBySig(sig) public](#hashbysig)
- [bySig(signer, sig, signature) public](#bysig)
- [sponsoredCall(token, amount, data, extraData) public](#sponsoredcall)
- [_chargeSigner(signer, relayer, token, amount, extraData) internal](#_chargesigner)
- [useBySigAccountNonce(advance) public](#usebysigaccountnonce)
- [useBySigSelectorNonce(selector, advance) public](#usebysigselectornonce)
- [useBySigUniqueNonce(nonce) public](#usebysiguniquenonce)
- [_msgSender() internal](#_msgsender)

### Errors list
- [WrongNonce() ](#wrongnonce)
- [WrongRelayer() ](#wrongrelayer)
- [WrongSignature() ](#wrongsignature)
- [DeadlineExceeded() ](#deadlineexceeded)

### Types
### SignedCall

```solidity
struct SignedCall {
  BySigTraits.Value traits;
  bytes data;
}
```

### Functions
### bySigAccountNonces

```solidity
function bySigAccountNonces(address account) public view returns (uint256)
```

### bySigSelectorNonces

```solidity
function bySigSelectorNonces(address account, bytes4 selector) public view returns (uint256)
```

### bySigUniqueNonces

```solidity
function bySigUniqueNonces(address account, uint256 nonce) public view returns (bool)
```

### bySigUniqueNoncesSlot

```solidity
function bySigUniqueNoncesSlot(address account, uint256 nonce) public view returns (uint256)
```

### hashBySig

```solidity
function hashBySig(struct BySig.SignedCall sig) public view returns (bytes32)
```

### bySig

```solidity
function bySig(address signer, struct BySig.SignedCall sig, bytes signature) public payable returns (bytes ret)
```

### sponsoredCall

```solidity
function sponsoredCall(address token, uint256 amount, bytes data, bytes extraData) public payable returns (bytes ret)
```

### _chargeSigner

```solidity
function _chargeSigner(address signer, address relayer, address token, uint256 amount, bytes extraData) internal virtual
```

### useBySigAccountNonce

```solidity
function useBySigAccountNonce(uint32 advance) public
```

### useBySigSelectorNonce

```solidity
function useBySigSelectorNonce(bytes4 selector, uint32 advance) public
```

### useBySigUniqueNonce

```solidity
function useBySigUniqueNonce(uint256 nonce) public
```

### _msgSender

```solidity
function _msgSender() internal view virtual returns (address)
```

### Errors
### WrongNonce

```solidity
error WrongNonce()
```

### WrongRelayer

```solidity
error WrongRelayer()
```

### WrongSignature

```solidity
error WrongSignature()
```

### DeadlineExceeded

```solidity
error DeadlineExceeded()
```

