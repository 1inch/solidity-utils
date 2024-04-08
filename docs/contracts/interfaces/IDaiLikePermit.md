
## IDaiLikePermit

_Interface for Dai-like permit function allowing token spending via signatures._

### Functions list
- [permit(holder, spender, nonce, expiry, allowed, v, r, s) external](#permit)

### Functions
### permit

```solidity
function permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s) external
```
Approves spending of tokens via off-chain signatures.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| holder | address | Token holder's address. |
| spender | address | Spender's address. |
| nonce | uint256 | Current nonce of the holder. |
| expiry | uint256 | Time when the permit expires. |
| allowed | bool | True to allow, false to disallow spending. |
| v | uint8 |  |
| r | bytes32 |  |
| s | bytes32 | Signature components. |

