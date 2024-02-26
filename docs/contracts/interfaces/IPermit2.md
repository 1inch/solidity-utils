# IPermit2


IPermit2


Interface for a flexible permit system that extends ERC20 tokens to support permits in tokens lacking native permit functionality.


## Functions
### transferFrom
```solidity
function transferFrom(
  address user,
  address spender,
  uint160 amount,
  address token
) external
```
Executes a token transfer from one address to another.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | The token owner's address.  
|`spender` | address | The address authorized to spend the tokens.  
|`amount` | uint160 | The amount of tokens to transfer.  
|`token` | address | The address of the token being transferred. 


### permit
```solidity
function permit(
  address owner,
  struct IPermit2.PermitSingle permitSingle,
  bytes signature
) external
```
Issues a permit for spending tokens via a signed authorization.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`owner` | address | The token owner's address.  
|`permitSingle` | struct IPermit2.PermitSingle | Struct containing the permit details.  
|`signature` | bytes | The signature proving the owner authorized the permit. 


### allowance
```solidity
function allowance(
  address user,
  address token,
  address spender
) external returns (struct IPermit2.PackedAllowance)
```
Retrieves the allowance details between a token owner and spender.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`user` | address | The token owner's address.  
|`token` | address | The token address.  
|`spender` | address | The spender's address.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`The`| struct IPermit2.PackedAllowance | packed allowance details.

