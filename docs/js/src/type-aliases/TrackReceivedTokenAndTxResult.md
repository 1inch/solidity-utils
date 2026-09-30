[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / TrackReceivedTokenAndTxResult

# Type Alias: TrackReceivedTokenAndTxResult

> **TrackReceivedTokenAndTxResult** = \[`bigint`, `ContractTransactionReceipt` \| `TrackReceivedTokenAndTxResult`\]

Defined in: [src/utils.ts:343](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L343)

Result returned by `trackReceivedTokenAndTx`.
The first item is the received amount. The second item is either the transaction
receipt or a nested result returned by another `trackReceivedTokenAndTx` call.
