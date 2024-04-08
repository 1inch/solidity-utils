
## UniERC20

_Library to abstract the handling of ETH and ERC20 tokens, enabling unified interaction with both. It allows usage of ETH as ERC20.
Utilizes SafeERC20 for ERC20 interactions and provides additional utility functions._

### Functions list
- [isETH(token) internal](#iseth)
- [uniBalanceOf(token, account) internal](#unibalanceof)
- [uniTransfer(token, to, amount) internal](#unitransfer)
- [uniTransferFrom(token, from, to, amount) internal](#unitransferfrom)
- [uniSymbol(token) internal](#unisymbol)
- [uniName(token) internal](#uniname)
- [uniApprove(token, to, amount) internal](#uniapprove)

### Errors list
- [InsufficientBalance() ](#insufficientbalance)
- [ApproveCalledOnETH() ](#approvecalledoneth)
- [NotEnoughValue() ](#notenoughvalue)
- [FromIsNotSender() ](#fromisnotsender)
- [ToIsNotThis() ](#toisnotthis)
- [ETHTransferFailed() ](#ethtransferfailed)

### Functions
### isETH

```solidity
function isETH(contract IERC20 token) internal pure returns (bool)
```

_Determines if the specified token is ETH._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The token to check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | bool | bool True if the token is ETH, false otherwise. |

### uniBalanceOf

```solidity
function uniBalanceOf(contract IERC20 token, address account) internal view returns (uint256)
```

_Retrieves the balance of the specified token for an account._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The token to query the balance of. |
| account | address | The address of the account. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | uint256 | uint256 The balance of the token for the specified account. |

### uniTransfer

```solidity
function uniTransfer(contract IERC20 token, address payable to, uint256 amount) internal
```

_Transfers a specified amount of the token to a given address.
Note: Does nothing if the amount is zero._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The token to transfer. |
| to | address payable | The address to transfer the token to. |
| amount | uint256 | The amount of the token to transfer. |

### uniTransferFrom

```solidity
function uniTransferFrom(contract IERC20 token, address payable from, address to, uint256 amount) internal
```

_Transfers a specified amount of the token from one address to another.
Note: Does nothing if the amount is zero._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The token to transfer. |
| from | address payable | The address to transfer the token from. |
| to | address | The address to transfer the token to. |
| amount | uint256 | The amount of the token to transfer. |

### uniSymbol

```solidity
function uniSymbol(contract IERC20 token) internal view returns (string)
```

_Retrieves the symbol from ERC20 metadata of the specified token._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The token to retrieve the symbol of. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | string | string The symbol of the token. |

### uniName

```solidity
function uniName(contract IERC20 token) internal view returns (string)
```

_Retrieves the name from ERC20 metadata of the specified token._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The token to retrieve the name of. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | string | string The name of the token. |

### uniApprove

```solidity
function uniApprove(contract IERC20 token, address to, uint256 amount) internal
```

_forceApprove the specified amount of the token to a given address.
Reverts if the token is ETH._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The token to approve. |
| to | address | The address to approve the token to. |
| amount | uint256 | The amount of the token to approve. |

### Errors
### InsufficientBalance

```solidity
error InsufficientBalance()
```

### ApproveCalledOnETH

```solidity
error ApproveCalledOnETH()
```

### NotEnoughValue

```solidity
error NotEnoughValue()
```

### FromIsNotSender

```solidity
error FromIsNotSender()
```

### ToIsNotThis

```solidity
error ToIsNotThis()
```

### ETHTransferFailed

```solidity
error ETHTransferFailed()
```

