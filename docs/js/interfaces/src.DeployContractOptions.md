[@1inch/solidity-utils](../README.md) / [Modules](../modules.md) / [src](../modules/src.md) / DeployContractOptions

# Interface: DeployContractOptions

[src](../modules/src.md).DeployContractOptions

**`Notice`**

Options for deployment methods.

**`Param`**

Name of the contract to deploy.

**`Param`**

Arguments for the contract's constructor.

**`Param`**

Deployment facilitator object from Hardhat.

**`Param`**

Wallet deploying the contract.

**`Param`**

Optional custom name for deployment.

**`Param`**

Skips Etherscan verification if true.

**`Param`**

Avoids redeployment if contract already deployed.

**`Param`**

Gas strategy option.

**`Param`**

Gas strategy option.

**`Param`**

Gas strategy option.

**`Param`**

Toggles deployment logging.

**`Param`**

Number of confirmations to wait based on network. Ussually it's need for waiting before Etherscan verification.

## Table of contents

### Properties

- [constructorArgs](src.DeployContractOptions.md#constructorargs)
- [contractName](src.DeployContractOptions.md#contractname)
- [deployer](src.DeployContractOptions.md#deployer)
- [deploymentName](src.DeployContractOptions.md#deploymentname)
- [deployments](src.DeployContractOptions.md#deployments)
- [gasPrice](src.DeployContractOptions.md#gasprice)
- [log](src.DeployContractOptions.md#log)
- [maxFeePerGas](src.DeployContractOptions.md#maxfeepergas)
- [maxPriorityFeePerGas](src.DeployContractOptions.md#maxpriorityfeepergas)
- [skipIfAlreadyDeployed](src.DeployContractOptions.md#skipifalreadydeployed)
- [skipVerify](src.DeployContractOptions.md#skipverify)
- [waitConfirmations](src.DeployContractOptions.md#waitconfirmations)

## Properties

### constructorArgs

• `Optional` **constructorArgs**: `any`[]

#### Defined in

[src/utils.ts:29](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L29)

___

### contractName

• **contractName**: `string`

#### Defined in

[src/utils.ts:27](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L27)

___

### deployer

• **deployer**: `string`

#### Defined in

[src/utils.ts:31](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L31)

___

### deploymentName

• `Optional` **deploymentName**: `string`

#### Defined in

[src/utils.ts:32](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L32)

___

### deployments

• **deployments**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `deploy` | (`name`: `string`, `options`: `DeployOptions`) => `Promise`\<`DeployResult`\> |

#### Defined in

[src/utils.ts:30](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L30)

___

### gasPrice

• `Optional` **gasPrice**: `bigint`

#### Defined in

[src/utils.ts:35](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L35)

___

### log

• `Optional` **log**: `boolean`

#### Defined in

[src/utils.ts:38](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L38)

___

### maxFeePerGas

• `Optional` **maxFeePerGas**: `bigint`

#### Defined in

[src/utils.ts:37](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L37)

___

### maxPriorityFeePerGas

• `Optional` **maxPriorityFeePerGas**: `bigint`

#### Defined in

[src/utils.ts:36](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L36)

___

### skipIfAlreadyDeployed

• `Optional` **skipIfAlreadyDeployed**: `boolean`

#### Defined in

[src/utils.ts:34](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L34)

___

### skipVerify

• `Optional` **skipVerify**: `boolean`

#### Defined in

[src/utils.ts:33](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L33)

___

### waitConfirmations

• `Optional` **waitConfirmations**: `number`

#### Defined in

[src/utils.ts:39](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L39)
