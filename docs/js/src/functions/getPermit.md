[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / getPermit

# Function: getPermit()

> **getPermit**(`owner`, `permitContract`, `tokenVersion`, `chainId`, `spender`, `value`, `deadline`, `compact`): `Promise`\<`string`\>

## Parameters

• **owner**: `Wallet` \| `HardhatEthersSigner`

The wallet or signer issuing the permit.

• **permitContract**: `ERC20Permit`

The contract object with ERC20Permit type and token address for which the permit creating.

• **tokenVersion**: `string`

The version of the token's EIP-712 domain.

• **chainId**: `number`

The unique identifier for the blockchain network.

• **spender**: `string`

The address allowed to spend the tokens.

• **value**: `string`

The amount of tokens the spender is allowed to use.

• **deadline**: `string` = `...`

Time until when the permit is valid.

• **compact**: `boolean` = `false`

Indicates if the permit should be compressed.

## Returns

`Promise`\<`string`\>

A signed permit string.

## Defined in

[src/permit.ts:172](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/permit.ts#L172)
