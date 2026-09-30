[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / profileEVM

# Function: profileEVM()

> **profileEVM**(`provider`, `txHash`, `instruction`, `optionalTraceFile?`): `Promise`\<`number`[]\>

Defined in: [src/profileEVM.ts:142](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/profileEVM.ts#L142)

## Parameters

### provider

`JsonRpcProvider` \| \{ `send`: (`method`, `params`) => `Promise`\<`any`\>; \}

An Ethereum provider capable of sending custom RPC requests.

### txHash

`string`

The hash of the transaction to profile.

### instruction

`string`[]

An array of EVM instructions (opcodes) to count within the transaction's execution trace.

### optionalTraceFile?

`PathLike` \| `FileHandle`

An optional file path or handle where the full transaction trace will be saved.

## Returns

`Promise`\<`number`[]\>

An array of numbers representing the counts of each instruction specified, in the order they were provided.
