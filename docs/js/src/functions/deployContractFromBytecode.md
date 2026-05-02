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

[src/utils.ts:279](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/utils.ts#L279)
