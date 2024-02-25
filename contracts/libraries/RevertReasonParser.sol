// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./StringUtil.sol";

/**
 * @title RevertReasonParser
 * @notice Library that allows to parse unsuccessful arbitrary calls revert reasons.
 * See https://solidity.readthedocs.io/en/latest/control-structures.html#revert for details.
 * Note that we assume revert reason being abi-encoded as Error(string) so it may fail to parse reason
 * if structured reverts appear in the future.
 *
 * All unsuccessful parsings get encoded as Unknown(data) string
 */
library RevertReasonParser {
    using StringUtil for uint256;
    using StringUtil for bytes;

    error InvalidRevertReason();

    bytes4 private constant _ERROR_SELECTOR = bytes4(keccak256("Error(string)"));
    bytes4 private constant _PANIC_SELECTOR = bytes4(keccak256("Panic(uint256)"));

    /**
     * @dev Parses revert reason from failed calls, returning it with a `prefix`.
     * Handles standard `Error(string)` and `Panic(uint256)` formats, defaulting to `Unknown(data)` for unrecognized patterns.
     *
     * @param data The revert data to parse.
     * @param prefix String to add before the parsed reason for context.
     * @return The formatted revert reason.
     */
    function parse(bytes memory data, string memory prefix) internal pure returns (string memory) {
        // https://solidity.readthedocs.io/en/latest/control-structures.html#revert
        // We assume that revert reason is abi-encoded as Error(string)
        bytes4 selector;
        if (data.length >= 4) {
            assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
                selector := mload(add(data, 0x20))
            }
        }

        // 68 = 4-byte selector + 32 bytes offset + 32 bytes length
        if (selector == _ERROR_SELECTOR && data.length >= 68) {
            string memory reason;
            assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
                // 68 = 32 bytes data length + 4-byte selector + 32 bytes offset
                reason := add(data, 68)
            }
            /*
                revert reason is padded up to 32 bytes with ABI encoder: Error(string)
                also sometimes there is extra 32 bytes of zeros padded in the end:
                https://github.com/ethereum/solidity/issues/10170
                because of that we can't check for equality and instead check
                that string length + extra 68 bytes is equal or greater than overall data length
            */
            if (data.length >= 68 + bytes(reason).length) {
                return string.concat(prefix, "Error(", reason, ")");
            }
        }
        // 36 = 4-byte selector + 32 bytes integer
        else if (selector == _PANIC_SELECTOR && data.length == 36) {
            uint256 code;
            assembly ("memory-safe") { // solhint-disable-line no-inline-assembly
                // 36 = 32 bytes data length + 4-byte selector
                code := mload(add(data, 36))
            }
            return string.concat(prefix, "Panic(", code.toHex(), ")");
        }
        return string.concat(prefix, "Unknown(", data.toHex(), ")");
    }
}
