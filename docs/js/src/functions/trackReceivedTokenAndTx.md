[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / trackReceivedTokenAndTx

# Function: trackReceivedTokenAndTx()

> **trackReceivedTokenAndTx**\<`T`\>(`provider`, `token`, `wallet`, `txPromise`, ...`args`): `Promise`\<[`TrackReceivedTokenAndTxResult`](../type-aliases/TrackReceivedTokenAndTxResult.md)\>

## Type Parameters

• **T** *extends* `unknown`[]

## Parameters

• **provider**: `JsonRpcProvider` \| `object`

JSON RPC provider or custom provider object.

• **token**: [`Token`](../type-aliases/Token.md) \| `object` \| `object`

Token contract instance or ETH address constants.

• **wallet**: `string`

Wallet address to track.

• **txPromise**

Function returning a transaction promise.

• ...**args**: `T`

Arguments for the transaction promise function.

## Returns

`Promise`\<[`TrackReceivedTokenAndTxResult`](../type-aliases/TrackReceivedTokenAndTxResult.md)\>

Tuple of balance change and transaction receipt.

## Defined in

[src/utils.ts:318](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L318)
