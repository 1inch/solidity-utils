[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [hardhat-setup](../README.md) / Networks

# Class: Networks

Defined in: [hardhat-setup/networks.ts:105](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/hardhat-setup/networks.ts#L105)

## Constructors

### Constructor

> **new Networks**(`useHardhat?`, `forkingNetworkName?`, `_saveHardhatDeployments?`, `forkingAccounts?`, `autoLoadEnv?`): `Networks`

Defined in: [hardhat-setup/networks.ts:118](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/hardhat-setup/networks.ts#L118)

Creates the network configuration accumulator.

#### Parameters

##### useHardhat?

`boolean` = `true`

Whether to add the default in-process Hardhat network.

##### forkingNetworkName?

`string`

Optional network to fork into the Hardhat network.

##### \_saveHardhatDeployments?

`boolean` = `false`

Reserved compatibility argument from hardhat-deploy v1; currently ignored.

##### forkingAccounts?

`EdrNetworkAccountsUserConfig`

Optional accounts for the Hardhat EDR network.

##### autoLoadEnv?

`boolean` = `true`

Whether to load `.env` before reading network configuration.

#### Returns

`Networks`

#### Throws

If `forkingNetworkName` is set but its RPC environment variable is missing.

## Properties

### etherscan

> **etherscan**: [`Etherscan`](../type-aliases/Etherscan.md)

Defined in: [hardhat-setup/networks.ts:107](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/hardhat-setup/networks.ts#L107)

***

### networks

> **networks**: `Record`\<`string`, `NetworkUserConfig`\> = `{}`

Defined in: [hardhat-setup/networks.ts:106](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/hardhat-setup/networks.ts#L106)

## Methods

### getEtherscanConfig()

> **getEtherscanConfig**(`network`): [`Etherscan`](../type-aliases/Etherscan.md)

Defined in: [hardhat-setup/networks.ts:272](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/hardhat-setup/networks.ts#L272)

Returns the explorer configuration for a network.
Cronos networks use the keyed API format required by their Etherscan v1-compatible API.

#### Parameters

##### network

`string`

Hardhat network name.

#### Returns

[`Etherscan`](../type-aliases/Etherscan.md)

Explorer API keys and custom chain configuration.

***

### getNetworksConfig()

> **getNetworksConfig**(): `Record`\<`string`, `NetworkUserConfig`\>

Defined in: [hardhat-setup/networks.ts:288](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/hardhat-setup/networks.ts#L288)

Returns all registered Hardhat network configurations.

#### Returns

`Record`\<`string`, `NetworkUserConfig`\>

Network configurations indexed by network name.

***

### register()

> **register**(`name`, `chainId`, `rpc?`, `privateKey?`, `etherscanNetworkName?`, `etherscanKey?`, `hardfork?`, `l1Network?`): `void`

Defined in: [hardhat-setup/networks.ts:170](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/hardhat-setup/networks.ts#L170)

Registers an HTTP network when all required connection and explorer values are present.

#### Parameters

##### name

`string`

Hardhat network name.

##### chainId

`number`

EIP-155 chain ID.

##### rpc?

`string`

RPC configuration accepted by `parseRpcEnv`.

##### privateKey?

`string`

Private key used by the network account.

##### etherscanNetworkName?

`string`

Explorer network identifier. Required for registration.

##### etherscanKey?

`string`

Explorer API key.

##### hardfork?

`string` = `'shanghai'`

Hardfork metadata retained on the network configuration.

##### l1Network?

`string`

Optional L1 network name used by zkSync-compatible configurations.

#### Returns

`void`

***

### registerAll()

> **registerAll**(): `object`

Defined in: [hardhat-setup/networks.ts:234](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/hardhat-setup/networks.ts#L234)

Registers all networks supported by this package from environment variables.
Networks without complete RPC, key, and explorer configuration are skipped.

#### Returns

`object`

The accumulated Hardhat network and Etherscan configurations.

##### etherscan

> **etherscan**: [`Etherscan`](../type-aliases/Etherscan.md)

##### networks

> **networks**: `Record`\<`string`, `NetworkUserConfig`\>

***

### registerCustom()

> **registerCustom**(`name`, `chainId`, `url?`, `privateKey?`, `etherscanKey?`, `apiURL?`, `browserURL?`, `hardfork?`): `void`

Defined in: [hardhat-setup/networks.ts:213](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/hardhat-setup/networks.ts#L213)

Registers an HTTP network and its custom block explorer.

#### Parameters

##### name

`string`

Hardhat and explorer network name.

##### chainId

`number`

EIP-155 chain ID.

##### url?

`string`

RPC URL.

##### privateKey?

`string`

Private key used by the network account.

##### etherscanKey?

`string`

Explorer API key.

##### apiURL?

`string` = `''`

Block explorer API endpoint.

##### browserURL?

`string` = `''`

Public block explorer URL.

##### hardfork?

`string` = `'paris'`

Hardfork metadata retained on the network configuration.

#### Returns

`void`
