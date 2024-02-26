# PermitAndCall


PermitAndCall


Abstract contract to support permit and action execution in a single transaction.
Allows tokens that implement EIP-2612 permits to be approved and spent in a single transaction.


## Functions
### permitAndCall
```solidity
function permitAndCall(
  bytes permit,
  bytes action
) external
```
Executes a permit for an ERC20 token and then a specified action in a single transaction.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`permit` | bytes | The permit data for the ERC20 token, allowing this contract to spend the token.  
|`action` | bytes | The data representing the action to be executed after the permit. 


