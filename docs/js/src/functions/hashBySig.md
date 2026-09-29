[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / hashBySig

# Function: hashBySig()

> **hashBySig**(`name`, `version`, `chainId`, `verifyingContract`, `sig`): `string`

Defined in: [src/bySig.ts:64](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/bySig.ts#L64)

Computes the EIP-712 hash for a given bySig call.

## Parameters

### name

`string`

The user readable name of EIP-712 domain.

### version

`string`

The version of the EIP-712 domain.

### chainId

`bigint`

The unique identifier for the blockchain network.

### verifyingContract

`string`

The Ethereum address of the contract that will verify the signature. This ties the signature to a specific contract.

### sig

[`SignedCallStruct`](../interfaces/SignedCallStruct.md)

The data to be signed.

## Returns

`string`

The EIP-712 hash of the fully encoded data.
