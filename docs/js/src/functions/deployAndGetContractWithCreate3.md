[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / deployAndGetContractWithCreate3

# Function: deployAndGetContractWithCreate3()

> **deployAndGetContractWithCreate3**(`options`): `Promise`\<`Contract`\>

## Parameters

• **options**: [`DeployContractOptionsWithCreate3`](../interfaces/DeployContractOptionsWithCreate3.md)

Deployment options. Default values:
   - constructorArgs: []
   - txSigner: first signer in the environment
   - deploymentName: contractName
   - skipVerify: false
   - skipIfAlreadyDeployed: true
   - waitConfirmations: 1 on dev chains, 6 on others

## Returns

`Promise`\<`Contract`\>

The deployed contract instance.

## Defined in

[src/utils.ts:132](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L132)
