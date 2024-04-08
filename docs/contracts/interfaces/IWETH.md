
## IWETH

_Interface for wrapper as WETH-like token._

### Functions list
- [deposit() external](#deposit)
- [withdraw(amount) external](#withdraw)

### Events list
- [Deposit(dst, wad) ](#deposit)
- [Withdrawal(src, wad) ](#withdrawal)

### Functions
### deposit

```solidity
function deposit() external payable
```
Deposit Ether to get wrapper tokens.

### withdraw

```solidity
function withdraw(uint256 amount) external
```
Withdraw wrapped tokens as Ether.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | Amount of wrapped tokens to withdraw. |

### Events
### Deposit

```solidity
event Deposit(address dst, uint256 wad)
```
Emitted when Ether is deposited to get wrapper tokens.

### Withdrawal

```solidity
event Withdrawal(address src, uint256 wad)
```
Emitted when wrapper tokens is withdrawn as Ether.

