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

[src/permit.ts:421](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/permit.ts#L421)
