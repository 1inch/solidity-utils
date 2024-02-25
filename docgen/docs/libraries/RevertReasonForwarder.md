# RevertReasonForwarder


RevertReasonForwarder

Provides utilities for forwarding and retrieving revert reasons from failed external calls.



## Functions
### reRevert
```solidity
function reRevert(
) internal
```

Forwards the revert reason from the latest external call.
This method allows propagating the revert reason of a failed external call to the caller.


### reReason
```solidity
function reReason(
) internal returns (bytes reason)
```

Retrieves the revert reason from the latest external call.
This method enables capturing the revert reason of a failed external call for inspection or processing.


#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`reason`| bytes | The latest external call revert reason.

