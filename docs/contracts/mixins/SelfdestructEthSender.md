# SelfdestructEthSender


SelfdestructEthSender

A one-time-use contract for cost-effective ETH transfers using the `selfdestruct` mechanism.

Upon construction, this contract verifies EVM compatibility with the Cancun upgrade, specifically
testing for support of transient storage via `tload`. It is intended for single-use, allowing for ETH to
be sent more cheaply by self-destructing and sending its balance to a designated address.


## Functions
### constructor
```solidity
function constructor(
) internal
```

Initializes the contract, verifying compatibility with the Cancun EVM upgrade through transient storage support check.


### stopAndTransferBalance
```solidity
function stopAndTransferBalance(
  address payable receiver
) external
```
Self-destruct contract, transferring the entire ETH balance of the contract to the specified address.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`receiver` | address payable | The recipient address of the contract's ETH balance. 


