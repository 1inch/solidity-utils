
## SelfdestructEthSenderMock

Mock contract extending SelfdestructEthSender for testing purposes, with added functionality to transfer ETH.

### Functions list
- [receive() external](#receive)
- [transferBalance(receiver) external](#transferbalance)

### Errors list
- [ETHTransferFailed() ](#ethtransferfailed)

### Functions
### receive

```solidity
receive() external payable
```
Allows the contract to receive ETH.

### transferBalance

```solidity
function transferBalance(address payable receiver) external payable
```
Transfers the contract's entire ETH balance to the specified address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| receiver | address payable | The address to which the contract's ETH balance will be transferred. |

### Errors
### ETHTransferFailed

```solidity
error ETHTransferFailed()
```
Indicates that an attempt to transfer ETH has failed.

