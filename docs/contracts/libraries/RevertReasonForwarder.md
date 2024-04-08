
## RevertReasonForwarder

Provides utilities for forwarding and retrieving revert reasons from failed external calls.

### Functions list
- [reRevert() internal](#rerevert)
- [reReason() internal](#rereason)

### Functions
### reRevert

```solidity
function reRevert() internal pure
```

_Forwards the revert reason from the latest external call.
This method allows propagating the revert reason of a failed external call to the caller._

### reReason

```solidity
function reReason() internal pure returns (bytes reason)
```

_Retrieves the revert reason from the latest external call.
This method enables capturing the revert reason of a failed external call for inspection or processing._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
reason | bytes | The latest external call revert reason. |

