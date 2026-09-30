[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / DeployContractOptions

# Interface: DeployContractOptions

Defined in: [src/utils.ts:64](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L64)

## Param

**contractName**

Name of the Hardhat contract artifact to deploy.

## Param

**constructorArgs**

Constructor arguments. Defaults to an empty array.

## Param

**env**

Rocketh environment used to persist deployment records.

## Param

**deployments**

Deprecated alias for `env`, retained for hardhat-deploy v1 migration.

## Param

**deployer**

Address of the signer that deploys the contract.

## Param

**deploymentName**

Name used to store the deployment. Defaults to `contractName`.

## Param

**skipVerify**

Whether to skip block explorer verification. Defaults to `false`.

## Param

**skipIfAlreadyDeployed**

Whether to reuse an existing deployment from `env`. Defaults to `true`.

## Param

**gasPrice**

Legacy gas price for the deployment transaction.

## Param

**maxPriorityFeePerGas**

EIP-1559 priority fee for the deployment transaction.

## Param

**maxFeePerGas**

EIP-1559 maximum fee for the deployment transaction.

## Param

**log**

Whether to log deployment and verification status. Defaults to `true`.

## Param

**waitConfirmations**

Confirmations to await. Defaults to 1 on development chains and 6 otherwise.

## Properties

### constructorArgs?

> `optional` **constructorArgs?**: `any`[]

Defined in: [src/utils.ts:67](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L67)

***

### contractName

> **contractName**: `string`

Defined in: [src/utils.ts:65](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L65)

***

### deployer

> **deployer**: `string`

Defined in: [src/utils.ts:70](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L70)

***

### deploymentName?

> `optional` **deploymentName?**: `string`

Defined in: [src/utils.ts:71](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L71)

***

### deployments?

> `optional` **deployments?**: `Environment`\<`UnresolvedUnknownNamedAccounts`, `UnresolvedNetworkSpecificData`, `UnknownDeployments`, `Record`\<`string`, `unknown`\>\>

Defined in: [src/utils.ts:69](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L69)

***

### env?

> `optional` **env?**: `Environment`\<`UnresolvedUnknownNamedAccounts`, `UnresolvedNetworkSpecificData`, `UnknownDeployments`, `Record`\<`string`, `unknown`\>\>

Defined in: [src/utils.ts:68](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L68)

***

### gasPrice?

> `optional` **gasPrice?**: `bigint`

Defined in: [src/utils.ts:74](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L74)

***

### log?

> `optional` **log?**: `boolean`

Defined in: [src/utils.ts:77](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L77)

***

### maxFeePerGas?

> `optional` **maxFeePerGas?**: `bigint`

Defined in: [src/utils.ts:76](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L76)

***

### maxPriorityFeePerGas?

> `optional` **maxPriorityFeePerGas?**: `bigint`

Defined in: [src/utils.ts:75](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L75)

***

### skipIfAlreadyDeployed?

> `optional` **skipIfAlreadyDeployed?**: `boolean`

Defined in: [src/utils.ts:73](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L73)

***

### skipVerify?

> `optional` **skipVerify?**: `boolean`

Defined in: [src/utils.ts:72](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L72)

***

### waitConfirmations?

> `optional` **waitConfirmations?**: `number`

Defined in: [src/utils.ts:78](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L78)
