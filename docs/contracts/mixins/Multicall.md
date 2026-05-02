
## Multicall

_Contract that enables batching multiple calls to itself in a single transaction.
Uses delegatecall to execute each call in the context of the inheriting contract._

### Functions list
- [multicall(data) external](#multicall)

### Functions
### multicall

```solidity
function multicall(bytes[] data) external
```

_Executes multiple calls to this contract in a single transaction.
Each call is executed via delegatecall, preserving the contract's storage context.
If any call fails, the entire transaction reverts with the original error._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | bytes[] | An array of encoded function calls to execute. |

