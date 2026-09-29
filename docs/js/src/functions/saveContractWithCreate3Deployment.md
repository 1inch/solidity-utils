[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / saveContractWithCreate3Deployment

# Function: saveContractWithCreate3Deployment()

> **saveContractWithCreate3Deployment**(`provider`, `env`, `contractName`, `deploymentName`, `constructorArgs`, `salt`, `create3Deployer`, `deployTxHash`, `skipVerify?`): `Promise`\<`Contract`\>

Defined in: [src/utils.ts:243](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L243)

## Parameters

### provider

`JsonRpcProvider` \| \{ `getTransactionReceipt`: (`hash`) => `Promise`\<`TransactionReceipt` \| `null`\>; \}

Provider used to retrieve the deployment transaction receipt.

### env

`Environment`\<`UnresolvedUnknownNamedAccounts`, `UnresolvedNetworkSpecificData`, `UnknownDeployments`, `Record`\<`string`, `unknown`\>\> \| `undefined`

Optional Rocketh environment in which to save the deployment.

### contractName

`string`

Name of the Hardhat contract artifact.

### deploymentName

`string`

Name used to store the deployment.

### constructorArgs

`any`[]

Constructor arguments used for deployment and verification.

### salt

`string`

CREATE3 salt used to derive the deployed address.

### create3Deployer

`string`

Address of the `ICreate3Deployer` contract.

### deployTxHash

`string`

Hash of the CREATE3 deployment transaction.

### skipVerify?

`boolean` = `false`

Whether to skip block explorer verification.

## Returns

`Promise`\<`Contract`\>

A contract instance connected to the derived address.
