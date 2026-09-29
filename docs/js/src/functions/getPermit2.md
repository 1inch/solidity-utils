[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / getPermit2

# Function: getPermit2()

> **getPermit2**(`owner`, `token`, `chainId`, `spender`, `amount`, `compact?`, `expiration?`, `sigDeadline?`): `Promise`\<`string`\>

Defined in: [src/permit.ts:235](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/permit.ts#L235)

## Parameters

### owner

`Wallet` \| `HardhatEthersSigner`

The wallet or signer issuing the permit.

### token

`string`

The address of the token for which the permit is creates.

### chainId

`number`

The unique identifier for the blockchain network.

### spender

`string`

The address allowed to spend the tokens.

### amount

`bigint`

The amount of tokens the spender is allowed to use.

### compact?

`boolean` = `false`

Indicates if the permit should be compressed.

### expiration?

`bigint` = `defaultDeadlinePermit2`

The time until when the permit is valid for Permit2.

### sigDeadline?

`bigint` = `defaultDeadlinePermit2`

Deadline for the signature to be considered valid.

## Returns

`Promise`\<`string`\>

A signed permit string specific to Permit2 contracts.
