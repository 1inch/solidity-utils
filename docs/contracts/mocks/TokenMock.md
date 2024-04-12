
## TokenMock

_Simple ERC20 token mock for testing purposes, with minting and burning capabilities restricted to the owner._

### Functions list
- [constructor(name, symbol) public](#constructor)
- [mint(account, amount) external](#mint)
- [burn(account, amount) external](#burn)

### Functions
### constructor

```solidity
constructor(string name, string symbol) public
```

_Initializes the contract with token name and symbol, setting the deployer as the owner._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | string | Name of the ERC20 token. |
| symbol | string | Symbol of the ERC20 token. |

### mint

```solidity
function mint(address account, uint256 amount) external
```
Mints tokens to a specified account, callable only by the owner.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The address to mint tokens to. |
| amount | uint256 | The amount of tokens to mint. |

### burn

```solidity
function burn(address account, uint256 amount) external
```
Burns tokens from a specified account, callable only by the owner.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The address to burn tokens from. |
| amount | uint256 | The amount of tokens to burn. |

