[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / decompressPermit

# Function: decompressPermit()

> **decompressPermit**(`permit`, `token`, `owner`, `spender`): `string`

Defined in: [src/permit.ts:422](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/permit.ts#L422)

## Parameters

### permit

`string`

The compressed permit function call string.

### token

`string`

The token address involved in the permit (for Permit2 type).

### owner

`string`

The owner address involved in the permit.

### spender

`string`

The spender address involved in the permit.

## Returns

`string`

The decompressed permit function call string.
