[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / gasspectEVM

# Function: gasspectEVM()

> **gasspectEVM**(`provider`, `txHash`, `gasspectOptions?`, `optionalTraceFile?`): `Promise`\<`string`[]\>

Defined in: [src/profileEVM.ts:171](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/profileEVM.ts#L171)

## Parameters

### provider

`JsonRpcProvider` \| \{ `send`: (`method`, `params`) => `Promise`\<`any`\>; \}

The Ethereum JSON RPC provider or any custom provider with a `send` method.

### txHash

`string`

Transaction hash to analyze.

### gasspectOptions?

`Record`\<`string`, `unknown`\> = `{}`

Analysis configuration, specifying filters and formatting for gas analysis. See `gasspectOptionsDefault` for default values.

### optionalTraceFile?

`PathLike` \| `FileHandle`

Optional path or handle to save the detailed transaction trace.

## Returns

`Promise`\<`string`[]\>

A detailed string array of operations meeting the criteria set in `gasspectOptions`.
