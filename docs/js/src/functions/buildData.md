[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / buildData

# Function: buildData()

> **buildData**(`name`, `version`, `chainId`, `verifyingContract`, `owner`, `spender`, `value`, `nonce`, `deadline`): `object`

## Parameters

• **name**: `string`

The user readable name of signing EIP-712 domain

• **version**: `string`

The version of the signing EIP-712 domain.

• **chainId**: `number`

The unique identifier for the blockchain network.

• **verifyingContract**: `string`

The Ethereum address of the contract that will verify the signature. This ties the signature to a specific contract.

• **owner**: `string`

The Ethereum address of the token owner granting permission to spend tokens on their behalf.

• **spender**: `string`

The Ethereum address of the party being granted permission to spend tokens on behalf of the owner.

• **value**: `string`

The amount of tokens the spender is permitted to spend.

• **nonce**: `string`

An arbitrary number used once to prevent replay attacks. Typically, this is the number of transactions sent by the owner.

• **deadline**: `string` = `...`

The timestamp until which the permit is valid. This provides a window of time in which the permit can be used.

## Returns

`object`

### domain

> `readonly` **domain**: `object`

### domain.chainId

> **chainId**: `number`

### domain.name

> **name**: `string`

### domain.verifyingContract

> **verifyingContract**: `string`

### domain.version

> **version**: `string`

### message

> `readonly` **message**: `object`

### message.deadline

> **deadline**: `string`

### message.nonce

> **nonce**: `string`

### message.owner

> **owner**: `string`

### message.spender

> **spender**: `string`

### message.value

> **value**: `string`

### types

> `readonly` **types**: `object`

### types.Permit

> **Permit**: `object`[]

## Defined in

[src/permit.ts:97](https://github.com/1inch/solidity-utils/blob/f9426ba6dab1eac9ac07fe3976b8d1cb2d2e5ba1/src/permit.ts#L97)
