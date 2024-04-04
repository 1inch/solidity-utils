
## OnlyWethReceiver

_Abstract contract extending EthReceiver to accept only ETH deposits from a specified WETH contract.
This contract ensures that only wrapped ETH (WETH) can be deposited, rejecting all other direct ETH transfers._

### Functions list
- [constructor(weth) internal](#constructor)
- [_receive() internal](#_receive)

### Functions
### constructor

```solidity
constructor(address weth) internal
```

_Sets the WETH contract address during construction._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| weth | address | Address of the WETH contract. |

### _receive

```solidity
function _receive() internal virtual
```

_Overrides _receive to restrict ETH transfers solely to the WETH contract.
Reverts with EthDepositRejected if ETH is sent from any other address._

