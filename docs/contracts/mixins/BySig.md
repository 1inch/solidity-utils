# BySig


Mixin that provides signature-based accessibility to every external method of the smart contract.


Inherit your contract from this mixin and use `_msgSender()` instead of `msg.sender` everywhere.

## Derives
- [EIP712](https://docs.openzeppelin.com/contracts/3.x/api/utils/cryptography#EIP712)
- [IERC5267](https://docs.openzeppelin.com/contracts/3.x/api/interfaces#IERC5267)
- [Context](https://docs.openzeppelin.com/contracts/3.x/api/utils#Context)

## Functions
### bySigAccountNonces
```solidity
function bySigAccountNonces(
  address account
) public returns (uint256)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`account` | address | 


### bySigSelectorNonces
```solidity
function bySigSelectorNonces(
  address account,
  bytes4 selector
) public returns (uint256)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`account` | address | 
|`selector` | bytes4 | 


### bySigUniqueNonces
```solidity
function bySigUniqueNonces(
  address account,
  uint256 nonce
) public returns (bool)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`account` | address | 
|`nonce` | uint256 | 


### bySigUniqueNoncesSlot
```solidity
function bySigUniqueNoncesSlot(
  address account,
  uint256 nonce
) public returns (uint256)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`account` | address | 
|`nonce` | uint256 | 


### hashBySig
```solidity
function hashBySig(
  struct BySig.SignedCall sig
) public returns (bytes32)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`sig` | struct BySig.SignedCall | 


### bySig
```solidity
function bySig(
  address signer,
  struct BySig.SignedCall sig,
  bytes signature
) public returns (bytes ret)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`signer` | address | 
|`sig` | struct BySig.SignedCall | 
|`signature` | bytes | 


### sponsoredCall
```solidity
function sponsoredCall(
  address token,
  uint256 amount,
  bytes data,
  bytes extraData
) public returns (bytes ret)
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`token` | address | 
|`amount` | uint256 | 
|`data` | bytes | 
|`extraData` | bytes | 


### _chargeSigner
```solidity
function _chargeSigner(
  address signer,
  address relayer,
  address token,
  uint256 amount,
  bytes extraData
) internal
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`signer` | address | 
|`relayer` | address | 
|`token` | address | 
|`amount` | uint256 | 
|`extraData` | bytes | 


### useBySigAccountNonce
```solidity
function useBySigAccountNonce(
  uint32 advance
) public
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`advance` | uint32 | 


### useBySigSelectorNonce
```solidity
function useBySigSelectorNonce(
  bytes4 selector,
  uint32 advance
) public
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`selector` | bytes4 | 
|`advance` | uint32 | 


### useBySigUniqueNonce
```solidity
function useBySigUniqueNonce(
  uint256 nonce
) public
```


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`nonce` | uint256 | 


### _msgSender
```solidity
function _msgSender(
) internal returns (address)
```




