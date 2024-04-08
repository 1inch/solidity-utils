
## BySig

Mixin that provides signature-based accessibility to every external method of the smart contract.

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

Represents a call to be signed and executed.

_This structure encapsulates all necessary information for executing a signed call,
including traits that specify how the call should be authorized and the actual data to be executed._

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
Retrieves the account nonce for the specified account.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The address of the account. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | uint256 | The current nonce for the account. |

### bySigSelectorNonces

```solidity
function bySigSelectorNonces(address account, bytes4 selector) public view returns (uint256)
```
Retrieves the selector nonce for a specific account and selector.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The address of the account. |
| selector | bytes4 | The selector for which the nonce is being retrieved. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | uint256 | The current nonce for the specified selector and account. |

### bySigUniqueNonces

```solidity
function bySigUniqueNonces(address account, uint256 nonce) public view returns (bool)
```
Checks if a unique nonce has already been used for a given account.

_This function divides the nonce space into slots to efficiently manage storage.
A unique nonce is considered used if its corresponding bit in the storage slot is set._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The address of the account for which the nonce is being checked. |
| nonce | uint256 | The unique nonce to check. It is divided into slots for storage efficiency. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | bool | bool True if the nonce has been used, false otherwise. |

### bySigUniqueNoncesSlot

```solidity
function bySigUniqueNoncesSlot(address account, uint256 nonce) public view returns (uint256)
```
Retrieves the storage slot value for a given account and nonce slot.

_This function allows access to the raw storage slot used to track used nonces, divided into slots for efficiency.
Each bit in the returned value represents the used/unused status of a nonce within that slot._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The address of the account for which the nonce slot is being retrieved. |
| nonce | uint256 | The nonce for which the storage slot is being retrieved. The function calculates the correct slot based on this value. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | uint256 | uint256 The raw value of the storage slot that tracks the used/unused status of nonces in the specified slot for the given account. |

### hashBySig

```solidity
function hashBySig(struct BySig.SignedCall sig) public view returns (bytes32)
```
Hashes a `SignedCall` struct using EIP-712 typed data hashing rules.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| sig | struct BySig.SignedCall | The `SignedCall` structure containing the call traits and data. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | bytes32 | The EIP-712 compliant hash of the `SignedCall` struct. |

### bySig

```solidity
function bySig(address signer, struct BySig.SignedCall sig, bytes signature) public payable returns (bytes ret)
```
Executes a signature-authorized call on behalf of the signer.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| signer | address | The address of the signer authorizing the call. |
| sig | struct BySig.SignedCall | The `SignedCall` structure containing the call traits and data. |
| signature | bytes | The signature authorizing the call. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
ret | bytes | The bytes result of the executed call. |

### sponsoredCall

```solidity
function sponsoredCall(address token, uint256 amount, bytes data, bytes extraData) public payable returns (bytes ret)
```
Executes a call sponsored by the signer (for instance, by fee), intended to be used,
for instance, in conjunction with `bySig`.

_Facilitates execution of a delegate call where the signer covers the transaction fees.
Requires `_chargeSigner` to be overridden to define the fee transfer logic._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | Address of the token used for sponsored logic (for instance, for fee payment). |
| amount | uint256 | amount value used for sponsored logic (for instance, fee amount to be charged to the signer). |
| data | bytes | Encoded function call to execute. |
| extraData | bytes | Additional data for sponsored process in `_chargeSigner` method. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
ret | bytes | Result of the executed call. |

### _chargeSigner

```solidity
function _chargeSigner(address signer, address relayer, address token, uint256 amount, bytes extraData) internal virtual
```

_Placeholder for custom logic to charge the signer for sponsored calls.
Override this method to implement sponsored call accounting.
Example imeplementation:

function _chargeSigner(address signer, address relayer, address token, uint256 amount, bytes calldata extraData) internal override {
   balances[token][signer] -= amount;
   balances[token][relayer] += amount;
}_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| signer | address | The address of the signer being charged. |
| relayer | address | The address of the relayer facilitating the call. |
| token | address | The token address used for charging. |
| amount | uint256 | The amount to be charged. |
| extraData | bytes | Additional data for sponsored call accounting and executions. |

### useBySigAccountNonce

```solidity
function useBySigAccountNonce(uint32 advance) public
```
Advances the account nonce for the sender by a specified amount.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| advance | uint32 | The amount by which to advance the nonce. |

### useBySigSelectorNonce

```solidity
function useBySigSelectorNonce(bytes4 selector, uint32 advance) public
```
Advances the selector nonce for the sender and a specific selector by a specified amount.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| selector | bytes4 | The selector for which the nonce is being advanced. |
| advance | uint32 | The amount by which to advance the nonce. |

### useBySigUniqueNonce

```solidity
function useBySigUniqueNonce(uint256 nonce) public
```
Marks a unique nonce as used for the sender.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| nonce | uint256 | The nonce being marked as used. |

### _msgSender

```solidity
function _msgSender() internal view virtual returns (address)
```

_Returns the address of the message sender, replacing the traditional `msg.sender` with a potentially signed sender._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | address | The address of the message sender. |

### Errors
### WrongNonce

```solidity
error WrongNonce()
```
Emitted when the nonce used for a call is incorrect.

### WrongRelayer

```solidity
error WrongRelayer()
```
Emitted when a call is made by an unauthorized relayer.

### WrongSignature

```solidity
error WrongSignature()
```
Emitted when the signature provided for a call does not match the expected signature.

### DeadlineExceeded

```solidity
error DeadlineExceeded()
```
Emitted when a call is attempted after the specified deadline has passed.

