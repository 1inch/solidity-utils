# IWETH


IWETH


Interface for wrapper as WETH-like token.

## Derives
- [IERC20](https://docs.openzeppelin.com/contracts/3.x/api/token/ERC20#IERC20)

## Functions
### deposit
```solidity
function deposit(
) external
```
Deposit Ether to get wrapper tokens.



### withdraw
```solidity
function withdraw(
  uint256 amount
) external
```
Withdraw wrapped tokens as Ether.


#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`amount` | uint256 | Amount of wrapped tokens to withdraw. 


## Events
### Deposit
```solidity
event Deposit(
  address dst,
  uint256 wad
)
```
Emitted when Ether is deposited to get wrapper tokens.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`dst` | address | 
|`wad` | uint256 | 

### Withdrawal
```solidity
event Withdrawal(
  address src,
  uint256 wad
)
```
Emitted when wrapper tokens is withdrawn as Ether.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`src` | address | 
|`wad` | uint256 | 

