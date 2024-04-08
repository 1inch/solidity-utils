
## SelfdestructEthSender

A one-time-use contract for cost-effective ETH transfers using the `selfdestruct` mechanism.

_Upon construction, this contract verifies EVM compatibility with the Cancun upgrade, specifically
testing for support of transient storage via `tload`. It is intended for single-use, allowing for ETH to
be sent more cheaply by self-destructing and sending its balance to a designated address._

### Functions list
- [constructor() internal](#constructor)
- [stopAndTransferBalance(receiver) external](#stopandtransferbalance)

### Functions
### constructor

```solidity
constructor() internal
```

_Initializes the contract, verifying compatibility with the Cancun EVM upgrade through transient storage support check._

### stopAndTransferBalance

```solidity
function stopAndTransferBalance(address payable receiver) external
```
Makes the selfdestruct call, transferring the entire ETH balance of the contract to the specified address.
Due to EIP-6780 chnges selfdestruct will destroy the contract only if it was created in the same transaction.
In other cases it will stop the execution and transfer all the ETH balance saving about 1700 gas comparing to trivial transfer.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| receiver | address payable | The recipient address of the contract's ETH balance. |

