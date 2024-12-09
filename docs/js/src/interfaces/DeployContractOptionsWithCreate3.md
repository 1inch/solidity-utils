[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / DeployContractOptionsWithCreate3

# Interface: DeployContractOptionsWithCreate3

## Param

Signer object to sign the deployment transaction.

## Param

Address of the create3 deployer contract, which related to `contracts/interfaces/ICreate3Deployer.sol`.

## Param

Salt value for create3 deployment.

## Extends

- `Omit`\<[`DeployContractOptions`](DeployContractOptions.md), `"deployer"`\>

## Properties

### constructorArgs?

> `optional` **constructorArgs**: `any`[]

#### Inherited from

`Omit.constructorArgs`

#### Defined in

[src/utils.ts:32](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L32)

***

### contractName

> **contractName**: `string`

#### Inherited from

`Omit.contractName`

#### Defined in

[src/utils.ts:30](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L30)

***

### create3Deployer

> **create3Deployer**: `string`

#### Defined in

[src/utils.ts:54](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L54)

***

### deploymentName?

> `optional` **deploymentName**: `string`

#### Inherited from

`Omit.deploymentName`

#### Defined in

[src/utils.ts:35](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L35)

***

### deployments

> **deployments**: `DeploymentsExtension`

#### Inherited from

`Omit.deployments`

#### Defined in

[src/utils.ts:33](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L33)

***

### gasPrice?

> `optional` **gasPrice**: `bigint`

#### Inherited from

`Omit.gasPrice`

#### Defined in

[src/utils.ts:38](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L38)

***

### log?

> `optional` **log**: `boolean`

#### Inherited from

`Omit.log`

#### Defined in

[src/utils.ts:41](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L41)

***

### maxFeePerGas?

> `optional` **maxFeePerGas**: `bigint`

#### Inherited from

`Omit.maxFeePerGas`

#### Defined in

[src/utils.ts:40](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L40)

***

### maxPriorityFeePerGas?

> `optional` **maxPriorityFeePerGas**: `bigint`

#### Inherited from

`Omit.maxPriorityFeePerGas`

#### Defined in

[src/utils.ts:39](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L39)

***

### salt

> **salt**: `string`

#### Defined in

[src/utils.ts:55](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L55)

***

### skipIfAlreadyDeployed?

> `optional` **skipIfAlreadyDeployed**: `boolean`

#### Inherited from

`Omit.skipIfAlreadyDeployed`

#### Defined in

[src/utils.ts:37](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L37)

***

### skipVerify?

> `optional` **skipVerify**: `boolean`

#### Inherited from

`Omit.skipVerify`

#### Defined in

[src/utils.ts:36](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L36)

***

### txSigner?

> `optional` **txSigner**: `Wallet` \| `HardhatEthersSigner`

#### Defined in

[src/utils.ts:53](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L53)

***

### waitConfirmations?

> `optional` **waitConfirmations**: `number`

#### Inherited from

`Omit.waitConfirmations`

#### Defined in

[src/utils.ts:42](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L42)
