[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / buildBySigTraits

# Function: buildBySigTraits()

> **buildBySigTraits**(`params`): `bigint`

Builds traits for {bySig} contract by combining params.

## Parameters

• **params** = `{}`

An object containing the following properties:
- `nonceType` The type of nonce to use. Default is `NonceType.Account`.
- `deadline` The deadline for the message. Default is `0`.
- `relayer` The relayer address. Default is the zero address.
- `nonce` The nonce. Default is `0`.

• **params.deadline**: `undefined` \| `number` = `0`

• **params.nonce**: `undefined` \| `number` = `0`

• **params.nonceType**: `undefined` \| [`NonceType`](../enumerations/NonceType.md) = `NonceType.Account`

• **params.relayer**: `undefined` \| `string` = `...`

## Returns

`bigint`

A bigint representing the combined traits.

## Throws

Error if provided with invalid parameters.

## Defined in

[src/bySig.ts:26](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/bySig.ts#L26)
