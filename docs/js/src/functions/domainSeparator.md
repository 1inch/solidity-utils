[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / domainSeparator

# Function: domainSeparator()

> **domainSeparator**(`name`, `version`, `chainId`, `verifyingContract`): `string`

Defined in: [src/permit.ts:74](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/permit.ts#L74)

## Parameters

### name

`string`

The user readable name of EIP-712 domain.

### version

`string`

The version of the EIP-712 domain.

### chainId

`string`

The unique identifier for the blockchain network.

### verifyingContract

`string`

The Ethereum address of the contract that will verify the signature. This ties the signature to a specific contract.

## Returns

`string`

The domain separator as a hex string.
