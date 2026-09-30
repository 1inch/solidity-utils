[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [hardhat-setup](../README.md) / parseRpcEnv

# Function: parseRpcEnv()

> **parseRpcEnv**(`envRpc`): `object`

Defined in: [hardhat-setup/networks.ts:61](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/hardhat-setup/networks.ts#L61)

## Parameters

### envRpc

`string`

RPC configuration string to parse.

## Returns

`object`

The RPC URL and, when supplied, the value for the `auth-key` HTTP header.

### authKeyHttpHeader?

> `optional` **authKeyHttpHeader?**: `string`

### url

> **url**: `string`

## Throws

If the URL is empty or the configuration contains more than one separator.
