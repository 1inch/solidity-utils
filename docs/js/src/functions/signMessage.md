[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / signMessage

# Function: signMessage()

> **signMessage**(`signer`, `messageHex?`): `Promise`\<`string`\>

Defined in: [src/utils.ts:403](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L403)

## Parameters

### signer

`Wallet` \| \{ `signMessage`: (`messageHex`) => `Promise`\<`string`\>; \}

Wallet or compatible message signer.

### messageHex?

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

Message bytes or hex string. Defaults to `0x`.

## Returns

`Promise`\<`string`\>

The signature with a normalized `v` value.
