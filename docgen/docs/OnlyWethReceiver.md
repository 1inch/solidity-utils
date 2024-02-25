# OnlyWethReceiver


OnlyWethReceiver


Abstract contract extending EthReceiver to accept only ETH deposits from a specified WETH contract.
This contract ensures that only wrapped ETH (WETH) can be deposited, rejecting all other direct ETH transfers.

## Derives
- [EthReceiver](EthReceiver.md)

## Functions
### constructor
```solidity
function constructor(
  address weth
) internal
```

Sets the WETH contract address during construction.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`weth` | address | Address of the WETH contract. 


### _receive
```solidity
function _receive(
) internal
```

Overrides _receive to restrict ETH transfers solely to the WETH contract.
Reverts with EthDepositRejected if ETH is sent from any other address.


