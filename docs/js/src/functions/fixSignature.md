[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / fixSignature

# Function: fixSignature()

> **fixSignature**(`signature`): `string`

Defined in: [src/utils.ts:387](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L387)

## Parameters

### signature

`string`

Hex-encoded 65-byte ECDSA signature.

## Returns

`string`

The signature with a normalized `v` value.

## See

https://github.com/ethereum/go-ethereum/blob/v1.8.23/internal/ethapi/api.go#L465
