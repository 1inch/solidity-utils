
## Simulator

_Contract that allows simulating delegatecalls without persisting state changes.
Always reverts with the simulation result, enabling off-chain simulation of transactions._

### Functions list
- [simulate(delegatee, data) external](#simulate)

### Errors list
- [Simulated(delegatee, data, success, result) ](#simulated)

### Functions
### simulate

```solidity
function simulate(address delegatee, bytes data) external payable
```

_Simulates a delegatecall to the target address and reverts with the result.
This function always reverts, returning the simulation outcome in the error data.
Can be used for off-chain simulation to preview transaction effects._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| delegatee | address | The address to delegatecall to. |
| data | bytes | The calldata to pass to the delegatee. |

### Errors
### Simulated

```solidity
error Simulated(address delegatee, bytes data, bool success, bytes result)
```

_Error containing the simulation result._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| delegatee | address | The address that was called via delegatecall. |
| data | bytes | The calldata that was passed to the delegatee. |
| success | bool | Whether the delegatecall succeeded. |
| result | bytes | The return data or revert reason from the delegatecall. |

