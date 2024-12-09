[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / deployAndGetContract

# Function: deployAndGetContract()

> **deployAndGetContract**(`options`): `Promise`\<`Contract`\>

## Parameters

• **options**: [`DeployContractOptions`](../interfaces/DeployContractOptions.md)

Deployment options. Default values:
   - constructorArgs: []
   - deploymentName: contractName
   - skipVerify: false
   - skipIfAlreadyDeployed: true
   - log: true
   - waitConfirmations: 1 on dev chains, 6 on others

## Returns

`Promise`\<`Contract`\>

The deployed contract instance.

## Defined in

[src/utils.ts:70](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L70)
