[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [hardhat-setup](../README.md) / Networks

# Class: Networks

## Constructors

### new Networks()

> **new Networks**(`useHardhat`, `forkingNetworkName`?, `saveHardhatDeployments`?, `forkingAccounts`?): [`Networks`](Networks.md)

#### Parameters

• **useHardhat**: `boolean` = `true`

• **forkingNetworkName?**: `string`

• **saveHardhatDeployments?**: `boolean` = `false`

• **forkingAccounts?**: `HardhatNetworkAccountsUserConfig`

#### Returns

[`Networks`](Networks.md)

#### Defined in

[hardhat-setup/networks.ts:75](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/hardhat-setup/networks.ts#L75)

## Properties

### etherscan

> **etherscan**: [`Etherscan`](../type-aliases/Etherscan.md)

#### Defined in

[hardhat-setup/networks.ts:73](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/hardhat-setup/networks.ts#L73)

***

### networks

> **networks**: `NetworksUserConfig` = `{}`

#### Defined in

[hardhat-setup/networks.ts:72](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/hardhat-setup/networks.ts#L72)

## Methods

### register()

> **register**(`name`, `chainId`, `rpc`?, `privateKey`?, `etherscanNetworkName`?, `etherscanKey`?, `hardfork`?): `void`

#### Parameters

• **name**: `string`

• **chainId**: `number`

• **rpc?**: `string`

• **privateKey?**: `string`

• **etherscanNetworkName?**: `string`

• **etherscanKey?**: `string`

• **hardfork?**: `string` = `'shanghai'`

#### Returns

`void`

#### Defined in

[hardhat-setup/networks.ts:99](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/hardhat-setup/networks.ts#L99)

***

### registerAll()

> **registerAll**(): `object`

#### Returns

`object`

##### etherscan

> **etherscan**: [`Etherscan`](../type-aliases/Etherscan.md)

##### networks

> **networks**: `NetworksUserConfig`

#### Defined in

[hardhat-setup/networks.ts:142](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/hardhat-setup/networks.ts#L142)

***

### registerCustom()

> **registerCustom**(`name`, `chainId`, `url`?, `privateKey`?, `etherscanKey`?, `apiURL`?, `browserURL`?, `hardfork`?): `void`

#### Parameters

• **name**: `string`

• **chainId**: `number`

• **url?**: `string`

• **privateKey?**: `string`

• **etherscanKey?**: `string`

• **apiURL?**: `string` = `''`

• **browserURL?**: `string` = `''`

• **hardfork?**: `string` = `'paris'`

#### Returns

`void`

#### Defined in

[hardhat-setup/networks.ts:116](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/hardhat-setup/networks.ts#L116)

***

### registerZksync()

> **registerZksync**(`name`, `chainId`, `rpc`?, `ethNetwork`?, `privateKey`?, `verifyURL`?, `hardfork`?): `void`

#### Parameters

• **name**: `string`

• **chainId**: `number`

• **rpc?**: `string`

• **ethNetwork?**: `string`

• **privateKey?**: `string`

• **verifyURL?**: `string`

• **hardfork?**: `string` = `'paris'`

#### Returns

`void`

#### Defined in

[hardhat-setup/networks.ts:123](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/hardhat-setup/networks.ts#L123)
