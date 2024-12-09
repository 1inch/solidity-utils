[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / decompressPermit

# Function: decompressPermit()

> **decompressPermit**(`permit`, `token`, `owner`, `spender`): `string`

## Parameters

• **permit**: `string`

The compressed permit function call string.

• **token**: `string`

The token address involved in the permit (for Permit2 type).

• **owner**: `string`

The owner address involved in the permit.

• **spender**: `string`

The spender address involved in the permit.

## Returns

`string`

The decompressed permit function call string.

## Defined in

[src/permit.ts:401](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/permit.ts#L401)
