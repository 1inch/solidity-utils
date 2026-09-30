[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / executionGas

# Function: executionGas()

> **executionGas**(`provider`, `txPromise`): `Promise`\<`number`\>

Defined in: [src/profileEVM.ts:13](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/profileEVM.ts#L13)

## Parameters

### provider

`JsonRpcProvider` \| \{ `send`: (`method`, `params`) => `Promise`\<`any`\>; \}

An Ethereum provider capable of sending custom RPC requests.

### txPromise

`Promise`\<`ContractTransactionResponse`\>

A promise that resolves to a sent transaction.

## Returns

`Promise`\<`number`\>

The execution gas consumed by the transaction's EVM operations.
