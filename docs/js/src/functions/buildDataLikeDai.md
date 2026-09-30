[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / buildDataLikeDai

# Function: buildDataLikeDai()

> **buildDataLikeDai**(`name`, `version`, `chainId`, `verifyingContract`, `holder`, `spender`, `nonce`, `allowed`, `expiry?`): `object`

Defined in: [src/permit.ts:131](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/permit.ts#L131)

## Parameters

### name

`string`

The user readable name of signing EIP-712 domain

### version

`string`

The version of the signing EIP-712 domain.

### chainId

`number`

The unique identifier for the blockchain network.

### verifyingContract

`string`

The Ethereum address of the contract that will verify the signature. This ties the signature to a specific contract.

### holder

`string`

The address of the token holder who is giving permission, establishing the source of the funds.

### spender

`string`

The address allowed to spend tokens on behalf of the holder, essentially the recipient of the permit.

### nonce

`string`

An arbitrary number used once to prevent replay attacks. Typically, this is the number of transactions sent by the owner.

### allowed

`boolean`

A boolean indicating whether the spender is allowed to spend the tokens, providing a clear permit status.

### expiry?

`string` = `...`

The time until which the permit is valid, offering a window during which the spender can use the permit.

## Returns

`object`

Structured data prepared for a Dai-like permit function.

### domain

> `readonly` **domain**: `object`

#### domain.chainId

> **chainId**: `number`

#### domain.name

> **name**: `string`

#### domain.verifyingContract

> **verifyingContract**: `string`

#### domain.version

> **version**: `string`

### message

> `readonly` **message**: `object`

#### message.allowed

> **allowed**: `boolean`

#### message.expiry

> **expiry**: `string`

#### message.holder

> **holder**: `string`

#### message.nonce

> **nonce**: `string`

#### message.spender

> **spender**: `string`

### types

> `readonly` **types**: `object`

#### types.Permit

> `readonly` **Permit**: `object`[] = `DaiLikePermit`
