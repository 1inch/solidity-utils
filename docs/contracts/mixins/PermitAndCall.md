
## PermitAndCall

_Abstract contract to support permit and action execution in a single transaction.
Allows tokens that implement EIP-2612 permits, DAI-like permits, USDC-like permits and Permit2 to be approved and spent in a single transaction._

### Functions list
- [permitAndCall(permit, action) external](#permitandcall)

### Functions
### permitAndCall

```solidity
function permitAndCall(bytes permit, bytes action) external payable
```
Executes a permit for an ERC20 token and then a specified action in a single transaction.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| permit | bytes | ERC20 token address (20 bytes) concatinated with the permit data, allowing this contract to spend the token. Format: [token address (20 bytes)][permit data] |
| action | bytes | The data representing the action to be executed after the permit. |

