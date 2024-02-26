[@1inch/solidity-utils](../README.md) / [Modules](../modules.md) / hardhat-setup

# Module: hardhat-setup

## Table of contents

### Classes

- [Networks](../classes/hardhat_setup.Networks.md)

### Functions

- [getNetwork](hardhat_setup.md#getnetwork)
- [parseRpcEnv](hardhat_setup.md#parserpcenv)
- [resetHardhatNetworkFork](hardhat_setup.md#resethardhatnetworkfork)

## Hardhat-Setup

### getNetwork

▸ **getNetwork**(): `string`

#### Returns

`string`

The network name.

**`Notice`**

A helper method to get the network name from the command line arguments.

#### Defined in

[hardhat-setup/networks.ts:13](https://github.com/1inch/solidity-utils/blob/3ce5fd8/hardhat-setup/networks.ts#L13)

___

### parseRpcEnv

▸ **parseRpcEnv**(`envRpc`): `Object`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `envRpc` | `string` | The RPC configuration string to parse. |

#### Returns

`Object`

An object containing the RPC URL and optional auth key HTTP header.

| Name | Type |
| :------ | :------ |
| `authKeyHttpHeader?` | `string` |
| `url` | `string` |

**`Notice`**

A helper method to parse RPC configuration strings. Checks that the string is in the expected format.

#### Defined in

[hardhat-setup/networks.ts:24](https://github.com/1inch/solidity-utils/blob/3ce5fd8/hardhat-setup/networks.ts#L24)

___

### resetHardhatNetworkFork

▸ **resetHardhatNetworkFork**(`network`, `networkName`): `Promise`\<`void`\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `network` | `Network` | The Hardhat network object. |
| `networkName` | `string` | The name of the network to reset to. |

#### Returns

`Promise`\<`void`\>

**`Notice`**

A helper method to reset the Hardhat network to the local network or to a fork.

#### Defined in

[hardhat-setup/networks.ts:38](https://github.com/1inch/solidity-utils/blob/3ce5fd8/hardhat-setup/networks.ts#L38)
