
## OtpModule

Abstract contract for OTP (One-Time Password) functionality
@dev
- OTPs are pre-generated off-chain using a hash chain:
    k_{0} = keccak256(secret)
    k_{1} = keccak256(k_{0}|user)
    k_{2} = keccak256(k_{1}|user)
    ...
    k_{n} = keccak(k_{n-1}|user)
- The contract stores the expected hash `keccak256(k_{i+1}|user)` of the next OTP.
- To authenticate, the user submits k_{i}, and the contract checks: `keccak256(k_{i}|msg.sender) == expected`
- After successful validation, the expected hash is updated to `keccak256(k_{i}|msg.sender)`
- Only the last 28 bytes (224 bits) of the hash are stored on-chain to save gas

### Functions list
- [_validateOtp(code, user) internal](#_validateotp)
- [setOTP(newCode, total, currentCode) external](#setotp)

### Events list
- [OTPRegistered(user, total) ](#otpregistered)
- [OTPUsed(user, remaining) ](#otpused)

### Errors list
- [BadOTP() ](#badotp)
- [OtpExhausted() ](#otpexhausted)
- [IncorrectOtpAmount() ](#incorrectotpamount)

### Functions
### _validateOtp

```solidity
function _validateOtp(bytes32 code, address user) internal
```

### setOTP

```solidity
function setOTP(bytes32 newCode, uint32 total, bytes32 currentCode) external
```
Registers or resets the OTP chain for the caller

_If an existing chain is active, requires the current OTP code to reset_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newCode | bytes32 | The last hash code `k_{n}` to be used in new hash chain |
| total | uint32 | The total number of OTP codes allowed to use, it's `n` in `k_{n}` from newCode param |
| currentCode | bytes32 | The current valid OTP code `k_{i}`, required if the chain is already initialized |

### Events
### OTPRegistered

```solidity
event OTPRegistered(address user, uint32 total)
```
Emitted when a user registers or resets their OTP chain

### OTPUsed

```solidity
event OTPUsed(address user, uint32 remaining)
```
Emitted when a valid OTP code is used by a user

### Errors
### BadOTP

```solidity
error BadOTP()
```
Emitted when the provided OTP code is invalid

### OtpExhausted

```solidity
error OtpExhausted()
```
Emitted when the user has exhausted all available OTP codes

### IncorrectOtpAmount

```solidity
error IncorrectOtpAmount()
```
Emitted when the OTP registration attempt specifies zero allowed codes

