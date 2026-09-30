[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / getPermitLikeUSDC

# Function: getPermitLikeUSDC()

> **getPermitLikeUSDC**(`owner`, `signer`, `permitContract`, `tokenVersion`, `chainId`, `spender`, `value`, `deadline?`): `Promise`\<`string`\>

Defined in: [src/permit.ts:322](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/permit.ts#L322)

## Parameters

### owner

`string`

Contract with isValidSignature function.

### signer

`Wallet` \| `HardhatEthersSigner`

The wallet or signer issuing the permit.

### permitContract

`USDCLikePermitMock`

The contract object with ERC7597Permit type and token address for which the permit creating.

### tokenVersion

`string`

The version of the token's EIP-712 domain.

### chainId

`number`

The unique identifier for the blockchain network.

### spender

`string`

The address allowed to spend the tokens.

### value

`string`

The amount of tokens the spender is allowed to use.

### deadline?

`string` = `...`

Time until when the permit is valid.

## Returns

`Promise`\<`string`\>

A signed permit string in ERC7597Permit format.
