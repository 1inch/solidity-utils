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

[src/permit.ts:73](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/permit.ts#L73)
