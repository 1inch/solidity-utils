[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / getAccountsWithCode

# Function: getAccountsWithCode()

> **getAccountsWithCode**(`code`): `Promise`\<`SignerWithAddress`[]\>

## Parameters

• **code**: `BytesLike` \| BytesLike \| undefined[] = `'0x'`

A single bytecode (applied to all accounts) or an array of bytecodes (one per account). Defaults to '0x'.

## Returns

`Promise`\<`SignerWithAddress`[]\>

A list of signers (accounts) with the specified code applied.

## Defined in

[src/utils.ts:434](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L434)
