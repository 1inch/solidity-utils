
## SafeERC20

Compared to the standard ERC20, this implementation offers several enhancements:
1. more gas-efficient, providing significant savings in transaction costs.
2. support for different permit implementations
3. forceApprove functionality
4. support for WETH deposit and withdraw

### Functions list
- [safeBalanceOf(token, account) internal](#safebalanceof)
- [safeTransferFromUniversal(token, from, to, amount, permit2) internal](#safetransferfromuniversal)
- [safeTransferFrom(token, from, to, amount) internal](#safetransferfrom)
- [safeTransferFromPermit2(token, from, to, amount) internal](#safetransferfrompermit2)
- [safeTransfer(token, to, value) internal](#safetransfer)
- [forceApprove(token, spender, value) internal](#forceapprove)
- [safeIncreaseAllowance(token, spender, value) internal](#safeincreaseallowance)
- [safeDecreaseAllowance(token, spender, value) internal](#safedecreaseallowance)
- [safePermit(token, permit) internal](#safepermit)
- [safePermit(token, owner, spender, permit) internal](#safepermit)
- [tryPermit(token, permit) internal](#trypermit)
- [tryPermit(token, owner, spender, permit) internal](#trypermit)
- [safeDeposit(weth, amount) internal](#safedeposit)
- [safeWithdraw(weth, amount) internal](#safewithdraw)
- [safeWithdrawTo(weth, amount, to) internal](#safewithdrawto)

### Errors list
- [SafeTransferFailed() ](#safetransferfailed)
- [SafeTransferFromFailed() ](#safetransferfromfailed)
- [ForceApproveFailed() ](#forceapprovefailed)
- [SafeIncreaseAllowanceFailed() ](#safeincreaseallowancefailed)
- [SafeDecreaseAllowanceFailed() ](#safedecreaseallowancefailed)
- [SafePermitBadLength() ](#safepermitbadlength)
- [Permit2TransferAmountTooHigh() ](#permit2transferamounttoohigh)

### Functions
### safeBalanceOf

```solidity
function safeBalanceOf(contract IERC20 token, address account) internal view returns (uint256 tokenBalance)
```
Fetches the balance of a specific ERC20 token held by an account.
Consumes less gas then regular `ERC20.balanceOf`.

_Note that the implementation does not perform dirty bits cleaning, so it is the
responsibility of the caller to make sure that the higher 96 bits of the `account` parameter are clean._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The IERC20 token contract for which the balance will be fetched. |
| account | address | The address of the account whose token balance will be fetched. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
tokenBalance | uint256 | The balance of the specified ERC20 token held by the account. |

### safeTransferFromUniversal

```solidity
function safeTransferFromUniversal(contract IERC20 token, address from, address to, uint256 amount, bool permit2) internal
```
Attempts to safely transfer tokens from one address to another.

_If permit2 is true, uses the Permit2 standard; otherwise uses the standard ERC20 transferFrom.
Either requires `true` in return data, or requires target to be smart-contract and empty return data.
Note that the implementation does not perform dirty bits cleaning, so it is the responsibility of
the caller to make sure that the higher 96 bits of the `from` and `to` parameters are clean._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The IERC20 token contract from which the tokens will be transferred. |
| from | address | The address from which the tokens will be transferred. |
| to | address | The address to which the tokens will be transferred. |
| amount | uint256 | The amount of tokens to transfer. |
| permit2 | bool | If true, uses the Permit2 standard for the transfer; otherwise uses the standard ERC20 transferFrom. |

### safeTransferFrom

```solidity
function safeTransferFrom(contract IERC20 token, address from, address to, uint256 amount) internal
```
Attempts to safely transfer tokens from one address to another using the ERC20 standard.

_Either requires `true` in return data, or requires target to be smart-contract and empty return data.
Note that the implementation does not perform dirty bits cleaning, so it is the responsibility of
the caller to make sure that the higher 96 bits of the `from` and `to` parameters are clean._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The IERC20 token contract from which the tokens will be transferred. |
| from | address | The address from which the tokens will be transferred. |
| to | address | The address to which the tokens will be transferred. |
| amount | uint256 | The amount of tokens to transfer. |

### safeTransferFromPermit2

```solidity
function safeTransferFromPermit2(contract IERC20 token, address from, address to, uint256 amount) internal
```
Attempts to safely transfer tokens from one address to another using the Permit2 standard.

_Either requires `true` in return data, or requires target to be smart-contract and empty return data.
Note that the implementation does not perform dirty bits cleaning, so it is the responsibility of
the caller to make sure that the higher 96 bits of the `from` and `to` parameters are clean._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The IERC20 token contract from which the tokens will be transferred. |
| from | address | The address from which the tokens will be transferred. |
| to | address | The address to which the tokens will be transferred. |
| amount | uint256 | The amount of tokens to transfer. |

### safeTransfer

```solidity
function safeTransfer(contract IERC20 token, address to, uint256 value) internal
```
Attempts to safely transfer tokens to another address.

_Either requires `true` in return data, or requires target to be smart-contract and empty return data.
Note that the implementation does not perform dirty bits cleaning, so it is the responsibility of
the caller to make sure that the higher 96 bits of the `to` parameter are clean._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The IERC20 token contract from which the tokens will be transferred. |
| to | address | The address to which the tokens will be transferred. |
| value | uint256 | The amount of tokens to transfer. |

### forceApprove

```solidity
function forceApprove(contract IERC20 token, address spender, uint256 value) internal
```
Attempts to approve a spender to spend a certain amount of tokens.

_If `approve(from, to, amount)` fails, it tries to set the allowance to zero, and retries the `approve` call.
Note that the implementation does not perform dirty bits cleaning, so it is the responsibility of
the caller to make sure that the higher 96 bits of the `spender` parameter are clean._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The IERC20 token contract on which the call will be made. |
| spender | address | The address which will spend the funds. |
| value | uint256 | The amount of tokens to be spent. |

### safeIncreaseAllowance

```solidity
function safeIncreaseAllowance(contract IERC20 token, address spender, uint256 value) internal
```
Safely increases the allowance of a spender.

_Increases with safe math check. Checks if the increased allowance will overflow, if yes, then it reverts the transaction.
Then uses `forceApprove` to increase the allowance.
Note that the implementation does not perform dirty bits cleaning, so it is the responsibility of
the caller to make sure that the higher 96 bits of the `spender` parameter are clean._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The IERC20 token contract on which the call will be made. |
| spender | address | The address which will spend the funds. |
| value | uint256 | The amount of tokens to increase the allowance by. |

### safeDecreaseAllowance

```solidity
function safeDecreaseAllowance(contract IERC20 token, address spender, uint256 value) internal
```
Safely decreases the allowance of a spender.

_Decreases with safe math check. Checks if the decreased allowance will underflow, if yes, then it reverts the transaction.
Then uses `forceApprove` to increase the allowance.
Note that the implementation does not perform dirty bits cleaning, so it is the responsibility of
the caller to make sure that the higher 96 bits of the `spender` parameter are clean._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The IERC20 token contract on which the call will be made. |
| spender | address | The address which will spend the funds. |
| value | uint256 | The amount of tokens to decrease the allowance by. |

### safePermit

```solidity
function safePermit(contract IERC20 token, bytes permit) internal
```
Attempts to execute the `permit` function on the provided token with the sender and contract as parameters.
Permit type is determined automatically based on permit calldata (IERC20Permit, IDaiLikePermit, and IPermit2).

_Wraps `tryPermit` function and forwards revert reason if permit fails._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The IERC20 token to execute the permit function on. |
| permit | bytes | The permit data to be used in the function call. |

### safePermit

```solidity
function safePermit(contract IERC20 token, address owner, address spender, bytes permit) internal
```
Attempts to execute the `permit` function on the provided token with custom owner and spender parameters.
Permit type is determined automatically based on permit calldata (IERC20Permit, IDaiLikePermit, and IPermit2).

_Wraps `tryPermit` function and forwards revert reason if permit fails.
Note that the implementation does not perform dirty bits cleaning, so it is the responsibility of
the caller to make sure that the higher 96 bits of the `owner` and `spender` parameters are clean._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The IERC20 token to execute the permit function on. |
| owner | address | The owner of the tokens for which the permit is made. |
| spender | address | The spender allowed to spend the tokens by the permit. |
| permit | bytes | The permit data to be used in the function call. |

### tryPermit

```solidity
function tryPermit(contract IERC20 token, bytes permit) internal returns (bool success)
```
Attempts to execute the `permit` function on the provided token with the sender and contract as parameters.

_Invokes `tryPermit` with sender as owner and contract as spender._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The IERC20 token to execute the permit function on. |
| permit | bytes | The permit data to be used in the function call. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
success | bool | Returns true if the permit function was successfully executed, false otherwise. |

### tryPermit

```solidity
function tryPermit(contract IERC20 token, address owner, address spender, bytes permit) internal returns (bool success)
```
The function attempts to call the permit function on a given ERC20 token.

_The function is designed to support a variety of permit functions, namely: IERC20Permit, IDaiLikePermit, IERC7597Permit and IPermit2.
It accommodates both Compact and Full formats of these permit types.
Please note, it is expected that the `expiration` parameter for the compact Permit2 and the `deadline` parameter
for the compact Permit are to be incremented by one before invoking this function. This approach is motivated by
gas efficiency considerations; as the unlimited expiration period is likely to be the most common scenario, and
zeros are cheaper to pass in terms of gas cost. Thus, callers should increment the expiration or deadline by one
before invocation for optimized performance.
Note that the implementation does not perform dirty bits cleaning, so it is the responsibility of
the caller to make sure that the higher 96 bits of the `owner` and `spender` parameters are clean._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The address of the ERC20 token on which to call the permit function. |
| owner | address | The owner of the tokens. This address should have signed the off-chain permit. |
| spender | address | The address which will be approved for transfer of tokens. |
| permit | bytes | The off-chain permit data, containing different fields depending on the type of permit function. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
success | bool | A boolean indicating whether the permit call was successful. |

### safeDeposit

```solidity
function safeDeposit(contract IWETH weth, uint256 amount) internal
```
Safely deposits a specified amount of Ether into the IWETH contract. Consumes less gas then regular `IWETH.deposit`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| weth | contract IWETH | The IWETH token contract. |
| amount | uint256 | The amount of Ether to deposit into the IWETH contract. |

### safeWithdraw

```solidity
function safeWithdraw(contract IWETH weth, uint256 amount) internal
```
Safely withdraws a specified amount of wrapped Ether from the IWETH contract. Consumes less gas then regular `IWETH.withdraw`.

_Uses inline assembly to interact with the IWETH contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| weth | contract IWETH | The IWETH token contract. |
| amount | uint256 | The amount of wrapped Ether to withdraw from the IWETH contract. |

### safeWithdrawTo

```solidity
function safeWithdrawTo(contract IWETH weth, uint256 amount, address to) internal
```
Safely withdraws a specified amount of wrapped Ether from the IWETH contract to a specified recipient.
Consumes less gas then regular `IWETH.withdraw`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| weth | contract IWETH | The IWETH token contract. |
| amount | uint256 | The amount of wrapped Ether to withdraw from the IWETH contract. |
| to | address | The recipient of the withdrawn Ether. |

### Errors
### SafeTransferFailed

```solidity
error SafeTransferFailed()
```

### SafeTransferFromFailed

```solidity
error SafeTransferFromFailed()
```

### ForceApproveFailed

```solidity
error ForceApproveFailed()
```

### SafeIncreaseAllowanceFailed

```solidity
error SafeIncreaseAllowanceFailed()
```

### SafeDecreaseAllowanceFailed

```solidity
error SafeDecreaseAllowanceFailed()
```

### SafePermitBadLength

```solidity
error SafePermitBadLength()
```

### Permit2TransferAmountTooHigh

```solidity
error Permit2TransferAmountTooHigh()
```

