
## ERC20PermitMock

_Extends ERC20Permit and TokenMock for testing purposes, incorporating permit functionality.
This contract simplifies the testing of ERC20 tokens with permit capabilities by allowing easy setup of initial states._

### Functions list
- [constructor(name, symbol, initialAccount, initialBalance) public](#constructor)

### Functions
### constructor

```solidity
constructor(string name, string symbol, address initialAccount, uint256 initialBalance) public payable
```

_Creates an instance of `ERC20PermitMock` with specified token details and initial token distribution._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | string | Name of the ERC20 token. |
| symbol | string | Symbol of the ERC20 token. |
| initialAccount | address | Address to receive the initial token supply. |
| initialBalance | uint256 | Amount of tokens to mint to the `initialAccount`. |

