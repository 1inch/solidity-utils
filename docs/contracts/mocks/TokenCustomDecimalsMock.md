
## TokenCustomDecimalsMock

_Extends ERC20Permit token with custom number of decimals and only owner access to `mint` and `burn` functionality._

### Functions list
- [constructor(name, symbol, amount, decimals_) public](#constructor)
- [mint(account, amount) external](#mint)
- [burn(account, amount) external](#burn)
- [decimals() public](#decimals)

### Functions
### constructor

```solidity
constructor(string name, string symbol, uint256 amount, uint8 decimals_) public
```

_Sets up the ERC20 token with a name, symbol, initial amount to mint, and custom decimals._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | string | Name of the token. |
| symbol | string | Symbol of the token. |
| amount | uint256 | Initial amount of tokens to mint to the owner. |
| decimals_ | uint8 | Custom number of decimal places for the token. |

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

### decimals

```solidity
function decimals() public view virtual returns (uint8)
```

_Returns the number of decimal places of the token._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | uint8 | Number of decimal places. |

