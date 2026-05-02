[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / getPermitLikeDai

# Function: getPermitLikeDai()

> **getPermitLikeDai**(`holder`, `permitContract`, `tokenVersion`, `chainId`, `spender`, `allowed`, `expiry`, `compact`): `Promise`\<`string`\>

## Parameters

• **holder**: `Wallet` \| `HardhatEthersSigner`

The wallet or signer issuing the permit.

• **permitContract**: `DaiLikePermitMock`

The contract object with ERC20PermitLikeDai type and token address for which the permit creating.

• **tokenVersion**: `string`

The version of the token's EIP-712 domain.

• **chainId**: `number`

The unique identifier for the blockchain network.

• **spender**: `string`

The address allowed to spend the tokens.

• **allowed**: `boolean`

Boolean indicating whether the spender is allowed to spend.

• **expiry**: `string` = `...`

Time until when the permit is valid.

• **compact**: `boolean` = `false`

Indicates if the permit should be compressed.

## Returns

`Promise`\<`string`\>

A signed permit string in Dai-like format.

## Defined in

[src/permit.ts:276](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/permit.ts#L276)
