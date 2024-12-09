[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / domainSeparator

# Function: domainSeparator()

> **domainSeparator**(`name`, `version`, `chainId`, `verifyingContract`): `string`

## Parameters

• **name**: `string`

The user readable name of EIP-712 domain.

• **version**: `string`

The version of the EIP-712 domain.

• **chainId**: `string`

The unique identifier for the blockchain network.

• **verifyingContract**: `string`

The Ethereum address of the contract that will verify the signature. This ties the signature to a specific contract.

## Returns

`string`

The domain separator as a hex string.

## Defined in

[src/permit.ts:72](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/permit.ts#L72)
