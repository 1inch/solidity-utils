[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / signSignedCall

# Function: signSignedCall()

> **signSignedCall**(`name`, `version`, `chainId`, `verifyingContract`, `signer`, `signedCall`): `Promise`\<`string`\>

Defined in: [src/bySig.ts:85](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/bySig.ts#L85)

Signs a given data for {bySig} contract call using EIP-712 standard.

## Parameters

### name

`string`

The user readable name of EIP-712 domain.

### version

`string`

The version of the EIP-712 domain.

### chainId

`string` \| `bigint`

The unique identifier for the blockchain network.

### verifyingContract

`string`

The Ethereum address of the contract that will verify the signature. This ties the signature to a specific contract.

### signer

`Wallet` \| `HardhatEthersSigner`

The wallet or signer to sign the data.

### signedCall

[`SignedCallStruct`](../interfaces/SignedCallStruct.md)

The call data to be signed, consisting of traits and data.

## Returns

`Promise`\<`string`\>

A Promise that resolves to the signature.
