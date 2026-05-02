[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / profileEVM

# Function: profileEVM()

> **profileEVM**(`provider`, `txHash`, `instruction`, `optionalTraceFile`?): `Promise`\<`number`[]\>

## Parameters

• **provider**: `JsonRpcProvider` \| `object`

An Ethereum provider capable of sending custom RPC requests.

• **txHash**: `string`

The hash of the transaction to profile.

• **instruction**: `string`[]

An array of EVM instructions (opcodes) to count within the transaction's execution trace.

• **optionalTraceFile?**: `PathLike` \| `FileHandle`

An optional file path or handle where the full transaction trace will be saved.

## Returns

`Promise`\<`number`[]\>

An array of numbers representing the counts of each instruction specified, in the order they were provided.

## Defined in

[src/profileEVM.ts:112](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/profileEVM.ts#L112)
