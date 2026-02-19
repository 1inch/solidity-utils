[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / getEthPrice

# Function: getEthPrice()

> **getEthPrice**(`nativeTokenSymbol`): `Promise`\<`bigint`\>

## Parameters

• **nativeTokenSymbol**: `string` = `'ETH'`

The symbol of the native token for which the price is being fetched, defaults to 'ETH'.

## Returns

`Promise`\<`bigint`\>

The price of the specified native token in USD, scaled by 1e18 to preserve precision.

## Defined in

[src/utils.ts:405](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L405)
