[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / buildBySigTraits

# Function: buildBySigTraits()

> **buildBySigTraits**(`params?`): `bigint`

Defined in: [src/bySig.ts:25](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/bySig.ts#L25)

Builds traits for {bySig} contract by combining params.

## Parameters

### params?

An object containing the following properties:
- `nonceType` The type of nonce to use. Default is `NonceType.Account`.
- `deadline` The deadline for the message. Default is `0`.
- `relayer` The relayer address. Default is the zero address.
- `nonce` The nonce. Default is `0`.

#### deadline?

`number` = `0`

#### nonce?

`number` = `0`

#### nonceType?

[`NonceType`](../enumerations/NonceType.md) = `NonceType.Account`

#### relayer?

`string` = `...`

## Returns

`bigint`

A bigint representing the combined traits.

## Throws

Error if provided with invalid parameters.
