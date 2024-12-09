[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / gasspectEVM

# Function: gasspectEVM()

> **gasspectEVM**(`provider`, `txHash`, `gasspectOptions`, `optionalTraceFile`?): `Promise`\<`string`[]\>

## Parameters

• **provider**: `JsonRpcProvider` \| `object`

The Ethereum JSON RPC provider or any custom provider with a `send` method.

• **txHash**: `string`

Transaction hash to analyze.

• **gasspectOptions**: `Record`\<`string`, `unknown`\> = `{}`

Analysis configuration, specifying filters and formatting for gas analysis. See `gasspectOptionsDefault` for default values.

• **optionalTraceFile?**: `PathLike` \| `FileHandle`

Optional path or handle to save the detailed transaction trace.

## Returns

`Promise`\<`string`[]\>

A detailed string array of operations meeting the criteria set in `gasspectOptions`.

## Defined in

[src/profileEVM.ts:141](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/profileEVM.ts#L141)
