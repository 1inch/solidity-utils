[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / hashBySig

# Function: hashBySig()

> **hashBySig**(`name`, `version`, `chainId`, `verifyingContract`, `sig`): `string`

Computes the EIP-712 hash for a given bySig call.

## Parameters

• **name**: `string`

The user readable name of EIP-712 domain.

• **version**: `string`

The version of the EIP-712 domain.

• **chainId**: `bigint`

The unique identifier for the blockchain network.

• **verifyingContract**: `string`

The Ethereum address of the contract that will verify the signature. This ties the signature to a specific contract.

• **sig**: [`SignedCallStruct`](../interfaces/SignedCallStruct.md)

The data to be signed.

## Returns

`string`

The EIP-712 hash of the fully encoded data.

## Defined in

[src/bySig.ts:65](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/bySig.ts#L65)
