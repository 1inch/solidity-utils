// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IERC1271 } from "@openzeppelin/contracts/interfaces/IERC1271.sol";

/// @dev Accepts every signature so tests can exercise ERC-7597 payloads of any length.
contract ERC1271AcceptAnyMock is IERC1271 {
    function isValidSignature(bytes32 /* hash */, bytes calldata /* signature */) external pure returns (bytes4) {
        return IERC1271.isValidSignature.selector;
    }
}
