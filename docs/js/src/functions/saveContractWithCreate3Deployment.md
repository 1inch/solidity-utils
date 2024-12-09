[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / saveContractWithCreate3Deployment

# Function: saveContractWithCreate3Deployment()

> **saveContractWithCreate3Deployment**(`provider`, `deployments`, `contractName`, `deploymentName`, `constructorArgs`, `salt`, `create3Deployer`, `deployTxHash`, `skipVerify`): `Promise`\<`Contract`\>

## Parameters

• **provider**: `HardhatEthersProvider` \| `JsonRpcProvider`

JSON RPC provider or Hardhat Ethers Provider.

• **deployments**: `DeploymentsExtension`

Deployment facilitator object from Hardhat.

• **contractName**: `string`

Name of the contract to deploy.

• **deploymentName**: `string`

Optional custom name for deployment.

• **constructorArgs**: `any`[]

Arguments for the contract's constructor.

• **salt**: `string`

Salt value for create3 deployment.

• **create3Deployer**: `string`

Address of the create3 deployer contract.

• **deployTxHash**: `string`

Transaction hash of the create3 deployment.

• **skipVerify**: `boolean` = `false`

Skips Etherscan verification if true.

## Returns

`Promise`\<`Contract`\>

The deployed contract instance.

## Defined in

[src/utils.ts:199](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L199)
