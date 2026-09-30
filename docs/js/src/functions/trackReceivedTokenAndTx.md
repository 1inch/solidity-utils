[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / trackReceivedTokenAndTx

# Function: trackReceivedTokenAndTx()

> **trackReceivedTokenAndTx**\<`T`\>(`provider`, `token`, `wallet`, `txPromise`, ...`args`): `Promise`\<[`TrackReceivedTokenAndTxResult`](../type-aliases/TrackReceivedTokenAndTxResult.md)\>

Defined in: [src/utils.ts:357](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L357)

## Type Parameters

### T

`T` *extends* `unknown`[]

## Parameters

### provider

`JsonRpcProvider` \| \{ `getBalance`: (`address`) => `Promise`\<`bigint`\>; \}

Provider used to read native-currency balances.

### token

[`Token`](../type-aliases/Token.md) \| \{ `address`: `"0x0000000000000000000000000000000000000000"`; \} \| \{ `address`: `"0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"`; \}

Token contract, `ZERO_ADDRESS`, or `EEE_ADDRESS` for native currency.

### wallet

`string`

Address whose balance change is measured.

### txPromise

(...`args`) => `Promise`\<`ContractTransactionResponse` \| [`TrackReceivedTokenAndTxResult`](../type-aliases/TrackReceivedTokenAndTxResult.md)\>

Function that sends a transaction or returns a nested tracking result.

### args

...`T`

Arguments forwarded to `txPromise`.

## Returns

`Promise`\<[`TrackReceivedTokenAndTxResult`](../type-aliases/TrackReceivedTokenAndTxResult.md)\>

The received amount and transaction receipt or nested tracking result.
