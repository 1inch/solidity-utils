[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / deployContractFromBytecode

# Function: deployContractFromBytecode()

> **deployContractFromBytecode**(`abi`, `bytecode`, `parameters?`, `signer?`): `Promise`\<`BaseContract`\>

Defined in: [src/utils.ts:319](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/utils.ts#L319)

## Parameters

### abi

`Abi`

Contract ABI.

### bytecode

`BytesLike`

Contract creation bytecode.

### parameters?

`BigNumberish`[] = `[]`

Constructor arguments. Defaults to an empty array.

### signer?

`Signer`

Optional signer used to deploy the contract.

## Returns

`Promise`\<`BaseContract`\>

The deployed contract instance.
