
## RevertReasonParser

Library that allows to parse unsuccessful arbitrary calls revert reasons.
See https://solidity.readthedocs.io/en/latest/control-structures.html#revert for details.
Note that we assume revert reason being abi-encoded as Error(string) so it may fail to parse reason
if structured reverts appear in the future.

All unsuccessful parsings get encoded as Unknown(data) string

### Functions list
- [parse(data, prefix) internal](#parse)

### Errors list
- [InvalidRevertReason() ](#invalidrevertreason)

### Functions
### parse

```solidity
function parse(bytes data, string prefix) internal pure returns (string)
```

_Parses revert reason from failed calls, returning it with a `prefix`.
Handles standard `Error(string)` and `Panic(uint256)` formats, defaulting to `Unknown(data)` for unrecognized patterns._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| data | bytes | The revert data to parse. |
| prefix | string | String to add before the parsed reason for context. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | string | The formatted revert reason. |

### Errors
### InvalidRevertReason

```solidity
error InvalidRevertReason()
```

