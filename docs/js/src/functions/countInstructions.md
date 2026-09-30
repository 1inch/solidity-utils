[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / countInstructions

# Function: countInstructions()

> **countInstructions**(`provider`, `txHash`, `instructions`): `Promise`\<`number`[]\>

Defined in: [src/utils.ts:418](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L418)

## Parameters

### provider

`JsonRpcProvider` \| \{ `send`: (`method`, `params`) => `Promise`\<`any`\>; \}

Provider that supports `debug_traceTransaction`.

### txHash

`string`

Transaction hash to trace.

### instructions

`string`[]

Opcode names to count, case-insensitively.

## Returns

`Promise`\<`number`[]\>

Counts in the same order as `instructions`.
