[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / getAccountsWithCode

# Function: getAccountsWithCode()

> **getAccountsWithCode**(`code?`): `Promise`\<`HardhatEthersSigner`[]\>

Defined in: [src/utils.ts:461](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L461)

## Parameters

### code?

`BytesLike` \| BytesLike \| undefined[]

One bytecode value for every account, or one optional value per account. Defaults to `0x`.

## Returns

`Promise`\<`HardhatEthersSigner`[]\>

Hardhat signers whose account code has been updated.
