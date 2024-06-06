[@1inch/solidity-utils](../README.md) / [Modules](../modules.md) / [hardhat-setup](../modules/hardhat_setup.md) / Networks

# Class: Networks

[hardhat-setup](../modules/hardhat_setup.md).Networks

**`Notice`**

The Network class is a helper class to register networks and Etherscan API keys.
See the [README](https://github.com/1inch/solidity-utils/tree/master/hardhat-setup/README.md) for usage.

## Table of contents

### Constructors

- [constructor](hardhat_setup.Networks.md#constructor)

### Properties

- [etherscan](hardhat_setup.Networks.md#etherscan)
- [networks](hardhat_setup.Networks.md#networks)

### Methods

- [register](hardhat_setup.Networks.md#register)
- [registerAll](hardhat_setup.Networks.md#registerall)
- [registerCustom](hardhat_setup.Networks.md#registercustom)
- [registerZksync](hardhat_setup.Networks.md#registerzksync)

## Constructors

### constructor

• **new Networks**(`useHardhat?`, `forkingNetworkName?`, `saveHardhatDeployments?`): [`Networks`](hardhat_setup.Networks.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `useHardhat` | `boolean` | `true` |
| `forkingNetworkName?` | `string` | `undefined` |
| `saveHardhatDeployments` | `boolean` | `false` |

#### Returns

[`Networks`](hardhat_setup.Networks.md)

#### Defined in

[hardhat-setup/networks.ts:75](https://github.com/1inch/solidity-utils/blob/dc69769/hardhat-setup/networks.ts#L75)

## Properties

### etherscan

• **etherscan**: [`Etherscan`](../modules/hardhat_setup.md#etherscan)

#### Defined in

[hardhat-setup/networks.ts:73](https://github.com/1inch/solidity-utils/blob/dc69769/hardhat-setup/networks.ts#L73)

___

### networks

• **networks**: `NetworksUserConfig` = `{}`

#### Defined in

[hardhat-setup/networks.ts:72](https://github.com/1inch/solidity-utils/blob/dc69769/hardhat-setup/networks.ts#L72)

## Methods

### register

▸ **register**(`name`, `chainId`, `rpc?`, `privateKey?`, `etherscanNetworkName?`, `etherscanKey?`, `hardfork?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `undefined` |
| `chainId` | `number` | `undefined` |
| `rpc?` | `string` | `undefined` |
| `privateKey?` | `string` | `undefined` |
| `etherscanNetworkName?` | `string` | `undefined` |
| `etherscanKey?` | `string` | `undefined` |
| `hardfork` | `string` | `'shanghai'` |

#### Returns

`void`

#### Defined in

[hardhat-setup/networks.ts:96](https://github.com/1inch/solidity-utils/blob/dc69769/hardhat-setup/networks.ts#L96)

___

### registerAll

▸ **registerAll**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `etherscan` | [`Etherscan`](../modules/hardhat_setup.md#etherscan) |
| `networks` | `NetworksUserConfig` |

#### Defined in

[hardhat-setup/networks.ts:139](https://github.com/1inch/solidity-utils/blob/dc69769/hardhat-setup/networks.ts#L139)

___

### registerCustom

▸ **registerCustom**(`name`, `chainId`, `url?`, `privateKey?`, `etherscanKey?`, `apiURL?`, `browserURL?`, `hardfork?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `undefined` |
| `chainId` | `number` | `undefined` |
| `url?` | `string` | `undefined` |
| `privateKey?` | `string` | `undefined` |
| `etherscanKey?` | `string` | `undefined` |
| `apiURL` | `string` | `''` |
| `browserURL` | `string` | `''` |
| `hardfork` | `string` | `'paris'` |

#### Returns

`void`

#### Defined in

[hardhat-setup/networks.ts:113](https://github.com/1inch/solidity-utils/blob/dc69769/hardhat-setup/networks.ts#L113)

___

### registerZksync

▸ **registerZksync**(`name`, `chainId`, `rpc?`, `ethNetwork?`, `privateKey?`, `verifyURL?`, `hardfork?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `name` | `string` | `undefined` |
| `chainId` | `number` | `undefined` |
| `rpc?` | `string` | `undefined` |
| `ethNetwork?` | `string` | `undefined` |
| `privateKey?` | `string` | `undefined` |
| `verifyURL?` | `string` | `undefined` |
| `hardfork` | `string` | `'paris'` |

#### Returns

`void`

#### Defined in

[hardhat-setup/networks.ts:120](https://github.com/1inch/solidity-utils/blob/dc69769/hardhat-setup/networks.ts#L120)
