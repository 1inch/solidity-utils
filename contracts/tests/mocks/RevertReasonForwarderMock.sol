// SPDX-License-Identifier: MIT
// solhint-disable one-contract-per-file

pragma solidity ^0.8.0;

import "../../libraries/RevertReasonForwarder.sol";

contract RevertReasonForwarderHelper {
    error RevertReason();

    function revertWithReason() external pure {
        revert RevertReason();
    }
}

contract RevertReasonForwarderMock {
    address payable private _helper;

    constructor(address helper) {
        _helper = payable(helper);
    }

    function reRevert() external payable {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = _helper.call{value: msg.value}(
            abi.encodeWithSignature("revertWithReason()")
        );
        if (!success) {
            RevertReasonForwarder.reRevert();
        }
    }

    function reReason() external payable returns (bytes memory) {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = _helper.call{value: msg.value}(
            abi.encodeWithSignature("revertWithReason()")
        );
        if (!success) {
            return RevertReasonForwarder.reReason();
        }
        return "";
    }
}
