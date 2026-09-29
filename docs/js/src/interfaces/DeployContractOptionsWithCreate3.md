[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / DeployContractOptionsWithCreate3

# Interface: DeployContractOptionsWithCreate3

Defined in: [src/utils.ts:88](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L88)

## Param

**txSigner**

Signer that sends the CREATE3 deployment transaction. Defaults to the first Hardhat signer.

## Param

**create3Deployer**

Address of the `ICreate3Deployer` contract.

## Param

**salt**

CREATE3 salt used to derive the deployed contract address.

## Extends

- `Omit`\<[`DeployContractOptions`](DeployContractOptions.md), `"deployer"`\>

## Properties

### constructorArgs?

> `optional` **constructorArgs?**: `any`[]

Defined in: [src/utils.ts:67](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L67)

#### Inherited from

[`DeployContractOptions`](DeployContractOptions.md).[`constructorArgs`](DeployContractOptions.md#constructorargs)

***

### contractName

> **contractName**: `string`

Defined in: [src/utils.ts:65](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L65)

#### Inherited from

[`DeployContractOptions`](DeployContractOptions.md).[`contractName`](DeployContractOptions.md#contractname)

***

### create3Deployer

> **create3Deployer**: `string`

Defined in: [src/utils.ts:90](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L90)

***

### deploymentName?

> `optional` **deploymentName?**: `string`

Defined in: [src/utils.ts:71](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L71)

#### Inherited from

[`DeployContractOptions`](DeployContractOptions.md).[`deploymentName`](DeployContractOptions.md#deploymentname)

***

### deployments?

> `optional` **deployments?**: `Environment`\<`UnresolvedUnknownNamedAccounts`, `UnresolvedNetworkSpecificData`, `UnknownDeployments`, `Record`\<`string`, `unknown`\>\>

Defined in: [src/utils.ts:69](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L69)

#### Inherited from

[`DeployContractOptions`](DeployContractOptions.md).[`deployments`](DeployContractOptions.md#deployments)

***

### env?

> `optional` **env?**: `Environment`\<`UnresolvedUnknownNamedAccounts`, `UnresolvedNetworkSpecificData`, `UnknownDeployments`, `Record`\<`string`, `unknown`\>\>

Defined in: [src/utils.ts:68](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L68)

#### Inherited from

[`DeployContractOptions`](DeployContractOptions.md).[`env`](DeployContractOptions.md#env)

***

### gasPrice?

> `optional` **gasPrice?**: `bigint`

Defined in: [src/utils.ts:74](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L74)

#### Inherited from

[`DeployContractOptions`](DeployContractOptions.md).[`gasPrice`](DeployContractOptions.md#gasprice)

***

### log?

> `optional` **log?**: `boolean`

Defined in: [src/utils.ts:77](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L77)

#### Inherited from

[`DeployContractOptions`](DeployContractOptions.md).[`log`](DeployContractOptions.md#log)

***

### maxFeePerGas?

> `optional` **maxFeePerGas?**: `bigint`

Defined in: [src/utils.ts:76](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L76)

#### Inherited from

[`DeployContractOptions`](DeployContractOptions.md).[`maxFeePerGas`](DeployContractOptions.md#maxfeepergas)

***

### maxPriorityFeePerGas?

> `optional` **maxPriorityFeePerGas?**: `bigint`

Defined in: [src/utils.ts:75](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L75)

#### Inherited from

[`DeployContractOptions`](DeployContractOptions.md).[`maxPriorityFeePerGas`](DeployContractOptions.md#maxpriorityfeepergas)

***

### salt

> **salt**: `string`

Defined in: [src/utils.ts:91](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L91)

***

### skipIfAlreadyDeployed?

> `optional` **skipIfAlreadyDeployed?**: `boolean`

Defined in: [src/utils.ts:73](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L73)

#### Inherited from

[`DeployContractOptions`](DeployContractOptions.md).[`skipIfAlreadyDeployed`](DeployContractOptions.md#skipifalreadydeployed)

***

### skipVerify?

> `optional` **skipVerify?**: `boolean`

Defined in: [src/utils.ts:72](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L72)

#### Inherited from

[`DeployContractOptions`](DeployContractOptions.md).[`skipVerify`](DeployContractOptions.md#skipverify)

***

### txSigner?

> `optional` **txSigner?**: `Wallet` \| `HardhatEthersSigner`

Defined in: [src/utils.ts:89](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L89)

***

### waitConfirmations?

> `optional` **waitConfirmations?**: `number`

Defined in: [src/utils.ts:78](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L78)

#### Inherited from

[`DeployContractOptions`](DeployContractOptions.md).[`waitConfirmations`](DeployContractOptions.md#waitconfirmations)
