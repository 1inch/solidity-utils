// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title OtpModule
 * @notice Abstract contract for OTP (One-Time Password) functionality
 * @dev
 * - OTPs are pre-generated off-chain using a hash chain:
 *     k_{0} = keccak256(secret)
 *     k_{1} = keccak256(k_{0}|user)
 *     k_{2} = keccak256(k_{1}|user)
 *     ...
 *     k_{n} = keccak(k_{n-1}|user)
 * - The contract stores the expected hash `keccak256(k_{i+1}|user)` of the next OTP.
 * - To authenticate, the user submits k_{i}, and the contract checks: `keccak256(k_{i}|msg.sender) == expected`
 * - After successful validation, the expected hash is updated to `keccak256(k_{i}|msg.sender)`
 * - Only the last 28 bytes (224 bits) of the hash are stored on-chain to save gas
 */
abstract contract OtpModule {
    /// @notice Emitted when the provided OTP code is invalid
    error BadOTP();
    /// @notice Emitted when the user has exhausted all available OTP codes
    error OtpExhausted();
    /// @notice Emitted when the OTP registration attempt specifies zero allowed codes
    error IncorrectOtpAmount();

    /// @notice Emitted when a user registers or resets their OTP chain
    event OTPRegistered(address indexed user, uint32 total);
    /// @notice Emitted when a valid OTP code is used by a user
    event OTPUsed(address indexed user, uint32 remaining);

    uint256 private constant _MASK_224 = type(uint224).max;

    /// @notice Stores the packed OTP state for each user
    /// @dev packed: remaining|expectedHash
    // [0..223] bits  - expectedHash: last 28 bytes of `keccak256(k_{i}|user)` for next OTP code
    // [224-255] bits - remaining: number of remaining OTP codes in 32 bits
    mapping(address => uint256) public otp;

    modifier onlyOTP(bytes32 code) {
        _validateOtp(code, msg.sender);
        _;
    }

    function _unpackOTP(uint256 packed) private pure returns (bytes32 expected, uint32 remaining) {
        remaining = uint32(packed >> 224);      // high 32 bits
        expected = bytes32(packed & _MASK_224); // low 224 bits
    }

    function _packOTP(bytes32 expected, uint32 remaining) private pure returns (uint256 packed) {
        packed = (uint256(remaining) << 224) | (uint256(expected) & _MASK_224);
    }

    function _validateOtp(bytes32 code, address user) internal {
        (bytes32 expected, uint32 remaining) = _unpackOTP(otp[user]);
        if (remaining == 0) revert OtpExhausted();
        if (uint224(uint256(keccak256(abi.encodePacked(code, user)))) != uint224(uint256(expected))) revert BadOTP();
        unchecked { remaining--; }
        otp[user] = _packOTP(code, remaining);
        emit OTPUsed(user, remaining);
    }

    /**
     * @notice Registers or resets the OTP chain for the caller
     * @dev If an existing chain is active, requires the current OTP code to reset
     * @param newCode The last hash code `k_{n}` to be used in new hash chain
     * @param total The total number of OTP codes allowed to use, it's `n` in `k_{n}` from newCode param
     * @param currentCode The current valid OTP code `k_{i}`, required if the chain is already initialized
     */
    function setOTP(bytes32 newCode, uint32 total, bytes32 currentCode) external {
        if (total == 0) revert IncorrectOtpAmount();
        (, uint32 remaining) = _unpackOTP(otp[msg.sender]);
        if (remaining != 0) {
            _validateOtp(currentCode, msg.sender);
        }
        otp[msg.sender] = _packOTP(newCode, total);
        emit OTPRegistered(msg.sender, total);
    }
}
