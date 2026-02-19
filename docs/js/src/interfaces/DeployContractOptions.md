[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / DeployContractOptions

# Interface: DeployContractOptions

## Param

Name of the contract to deploy.

## Param

Arguments for the contract's constructor.

## Param

Deployment facilitator object from Hardhat.

## Param

Wallet deploying the contract.

## Param

Optional custom name for deployment.

## Param

Skips Etherscan verification if true.

## Param

Avoids redeployment if contract already deployed.

## Param

Gas strategy option.

## Param

Gas strategy option.

## Param

Gas strategy option.

## Param

Toggles deployment logging.

## Param

Number of confirmations to wait based on network. Usually it's need for waiting before Etherscan verification.

## Properties

### constructorArgs?

> `optional` **constructorArgs**: `any`[]

#### Defined in

[src/utils.ts:32](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L32)

***

### contractName

> **contractName**: `string`

#### Defined in

[src/utils.ts:30](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L30)

***

### deployer

> **deployer**: `string`

#### Defined in

[src/utils.ts:34](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L34)

***

### deploymentName?

> `optional` **deploymentName**: `string`

#### Defined in

[src/utils.ts:35](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L35)

***

### deployments

> **deployments**: `DeploymentsExtension`

#### Defined in

[src/utils.ts:33](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L33)

***

### gasPrice?

> `optional` **gasPrice**: `bigint`

#### Defined in

[src/utils.ts:38](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L38)

***

### log?

> `optional` **log**: `boolean`

#### Defined in

[src/utils.ts:41](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L41)

***

### maxFeePerGas?

> `optional` **maxFeePerGas**: `bigint`

#### Defined in

[src/utils.ts:40](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L40)

***

### maxPriorityFeePerGas?

> `optional` **maxPriorityFeePerGas**: `bigint`

#### Defined in

[src/utils.ts:39](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L39)

***

### skipIfAlreadyDeployed?

> `optional` **skipIfAlreadyDeployed**: `boolean`

#### Defined in

[src/utils.ts:37](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L37)

***

### skipVerify?

> `optional` **skipVerify**: `boolean`

#### Defined in

[src/utils.ts:36](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L36)

***

### waitConfirmations?

> `optional` **waitConfirmations**: `number`

#### Defined in

[src/utils.ts:42](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L42)
