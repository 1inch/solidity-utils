# EthReceiver


EthReceiver


Abstract contract for rejecting direct ETH transfers from EOAs.
Implements a custom error and logic to reject ETH deposits from non-contract addresses.


## Functions
### receive
```solidity
function receive(
) external
```

External payable function to receive ETH, automatically rejects deposits from EOAs.


### _receive
```solidity
function _receive(
) internal
```

Internal function containing the logic to reject ETH deposits.
Can be overridden by derived contracts for specific behaviors while maintaining the base rejection mechanism.


