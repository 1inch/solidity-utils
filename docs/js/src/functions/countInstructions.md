[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / countInstructions

# Function: countInstructions()

> **countInstructions**(`provider`, `txHash`, `instructions`): `Promise`\<`number`[]\>

## Parameters

• **provider**: `JsonRpcProvider` \| `object`

JSON RPC provider or custom provider object.

• **txHash**: `string`

Transaction hash to analyze.

• **instructions**: `string`[]

Array of EVM instructions (opcodes) to count.

## Returns

`Promise`\<`number`[]\>

Array of instruction counts.

## Defined in

[src/utils.ts:380](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L380)
