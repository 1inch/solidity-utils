[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / getEthPrice

# Function: getEthPrice()

> **getEthPrice**(`nativeTokenSymbol?`): `Promise`\<`bigint`\>

Defined in: [src/utils.ts:439](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L439)

## Parameters

### nativeTokenSymbol?

`string` = `'ETH'`

Native token symbol. Defaults to `ETH`.

## Returns

`Promise`\<`bigint`\>

The USD price multiplied by 1e18.

## Throws

If the Coinbase response does not contain a parseable amount.
