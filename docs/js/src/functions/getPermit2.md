[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / getPermit2

# Function: getPermit2()

> **getPermit2**(`owner`, `token`, `chainId`, `spender`, `amount`, `compact`, `expiration`, `sigDeadline`): `Promise`\<`string`\>

## Parameters

• **owner**: `Wallet` \| `HardhatEthersSigner`

The wallet or signer issuing the permit.

• **token**: `string`

The address of the token for which the permit is creates.

• **chainId**: `number`

The unique identifier for the blockchain network.

• **spender**: `string`

The address allowed to spend the tokens.

• **amount**: `bigint`

The amount of tokens the spender is allowed to use.

• **compact**: `boolean` = `false`

Indicates if the permit should be compressed.

• **expiration**: `bigint` = `defaultDeadlinePermit2`

The time until when the permit is valid for Permit2.

• **sigDeadline**: `bigint` = `defaultDeadlinePermit2`

Deadline for the signature to be considered valid.

## Returns

`Promise`\<`string`\>

A signed permit string specific to Permit2 contracts.

## Defined in

[src/permit.ts:234](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/permit.ts#L234)
