[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [hardhat-setup](../README.md) / Networks

# Class: Networks

## Constructors

### new Networks()

> **new Networks**(`useHardhat`, `forkingNetworkName`?, `saveHardhatDeployments`?, `forkingAccounts`?, `autoLoadEnv`?): [`Networks`](Networks.md)

#### Parameters

• **useHardhat**: `boolean` = `true`

• **forkingNetworkName?**: `string`

• **saveHardhatDeployments?**: `boolean` = `false`

• **forkingAccounts?**: `HardhatNetworkAccountsUserConfig`

• **autoLoadEnv?**: `boolean` = `true`

#### Returns

[`Networks`](Networks.md)

#### Defined in

[hardhat-setup/networks.ts:87](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/hardhat-setup/networks.ts#L87)

## Properties

### etherscan

> **etherscan**: [`Etherscan`](../type-aliases/Etherscan.md)

#### Defined in

[hardhat-setup/networks.ts:85](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/hardhat-setup/networks.ts#L85)

***

### networks

> **networks**: `NetworksUserConfig` = `{}`

#### Defined in

[hardhat-setup/networks.ts:84](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/hardhat-setup/networks.ts#L84)

## Methods

### getEtherscanConfig()

> **getEtherscanConfig**(`network`): [`Etherscan`](../type-aliases/Etherscan.md)

#### Parameters

• **network**: `string`

#### Returns

[`Etherscan`](../type-aliases/Etherscan.md)

#### Defined in

[hardhat-setup/networks.ts:180](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/hardhat-setup/networks.ts#L180)

***

### getNetworksConfig()

> **getNetworksConfig**(): `NetworksUserConfig`

#### Returns

`NetworksUserConfig`

#### Defined in

[hardhat-setup/networks.ts:194](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/hardhat-setup/networks.ts#L194)

***

### register()

> **register**(`name`, `chainId`, `rpc`?, `privateKey`?, `etherscanNetworkName`?, `etherscanKey`?, `hardfork`?, `l1Network`?): `void`

#### Parameters

• **name**: `string`

• **chainId**: `number`

• **rpc?**: `string`

• **privateKey?**: `string`

• **etherscanNetworkName?**: `string`

• **etherscanKey?**: `string`

• **hardfork?**: `string` = `'shanghai'`

• **l1Network?**: `string`

#### Returns

`void`

#### Defined in

[hardhat-setup/networks.ts:124](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/hardhat-setup/networks.ts#L124)

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

[hardhat-setup/networks.ts:151](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/hardhat-setup/networks.ts#L151)

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

[hardhat-setup/networks.ts:144](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/hardhat-setup/networks.ts#L144)
