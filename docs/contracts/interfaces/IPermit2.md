
## IPermit2

_Interface for a flexible permit system that extends ERC20 tokens to support permits in tokens lacking native permit functionality._

### Types list
- [PermitDetails](#permitdetails)
- [PermitSingle](#permitsingle)
- [PackedAllowance](#packedallowance)

### Functions list
- [transferFrom(user, spender, amount, token) external](#transferfrom)
- [permit(owner, permitSingle, signature) external](#permit)
- [allowance(user, token, spender) external](#allowance)

### Types
### PermitDetails

_Struct for holding permit details._

```solidity
struct PermitDetails {
  address token;
  uint160 amount;
  uint48 expiration;
  uint48 nonce;
}
```
### PermitSingle

_Struct for a single token allowance permit._

```solidity
struct PermitSingle {
  struct IPermit2.PermitDetails details;
  address spender;
  uint256 sigDeadline;
}
```
### PackedAllowance

_Struct for packed allowance data to optimize storage._

```solidity
struct PackedAllowance {
  uint160 amount;
  uint48 expiration;
  uint48 nonce;
}
```

### Functions
### transferFrom

```solidity
function transferFrom(address user, address spender, uint160 amount, address token) external
```
Executes a token transfer from one address to another.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The token owner's address. |
| spender | address | The address authorized to spend the tokens. |
| amount | uint160 | The amount of tokens to transfer. |
| token | address | The address of the token being transferred. |

### permit

```solidity
function permit(address owner, struct IPermit2.PermitSingle permitSingle, bytes signature) external
```
Issues a permit for spending tokens via a signed authorization.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | The token owner's address. |
| permitSingle | struct IPermit2.PermitSingle | Struct containing the permit details. |
| signature | bytes | The signature proving the owner authorized the permit. |

### allowance

```solidity
function allowance(address user, address token, address spender) external view returns (struct IPermit2.PackedAllowance)
```
Retrieves the allowance details between a token owner and spender.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The token owner's address. |
| token | address | The token address. |
| spender | address | The spender's address. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | struct IPermit2.PackedAllowance | The packed allowance details. |

