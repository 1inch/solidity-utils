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

[src/utils.ts:379](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L379)
