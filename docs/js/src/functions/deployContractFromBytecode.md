[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / deployContractFromBytecode

# Function: deployContractFromBytecode()

> **deployContractFromBytecode**(`abi`, `bytecode`, `parameters`, `signer`?): `Promise`\<`BaseContract`\>

## Parameters

• **abi**: `any`[]

Contract ABI.

• **bytecode**: `BytesLike`

Contract bytecode.

• **parameters**: `BigNumberish`[] = `[]`

Constructor parameters.

• **signer?**: `Signer`

Optional signer object.

## Returns

`Promise`\<`BaseContract`\>

The deployed contract instance.

## Defined in

[src/utils.ts:278](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/utils.ts#L278)
