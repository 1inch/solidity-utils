
## EthReceiver

_Abstract contract for rejecting direct ETH transfers from EOAs.
Implements a custom error and logic to reject ETH deposits from non-contract addresses._

### Functions list
- [receive() external](#receive)
- [_receive() internal](#_receive)

### Errors list
- [EthDepositRejected() ](#ethdepositrejected)

### Functions
### receive

```solidity
receive() external payable
```

_External payable function to receive ETH, automatically rejects deposits from EOAs._

### _receive

```solidity
function _receive() internal virtual
```

_Internal function containing the logic to reject ETH deposits.
Can be overridden by derived contracts for specific behaviors while maintaining the base rejection mechanism._

### Errors
### EthDepositRejected

```solidity
error EthDepositRejected()
```

_Error thrown when an ETH deposit from an EOA is attempted._

