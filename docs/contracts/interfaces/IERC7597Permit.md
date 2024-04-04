# IERC7597Permit


IERC7597Permit


A new extension for ERC-2612 permit, which has already been added to USDC v2.2.


## Functions
### permit
```solidity
function permit(
  address owner,
  address spender,
  uint256 value,
  uint256 deadline,
  bytes signature
) external
```
Update allowance with a signed permit.

Signature bytes can be used for both EOA wallets and contract wallets.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`owner` | address | Token owner's address (Authorizer).  
|`spender` | address | Spender's address.  
|`value` | uint256 | Amount of allowance.  
|`deadline` | uint256 | The time at which the signature expires (unixtime).  
|`signature` | bytes | Unstructured bytes signature signed by an EOA wallet or a contract wallet. 


