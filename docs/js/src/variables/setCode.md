[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / setCode

# Variable: setCode

> `const` **setCode**: (`address`, `code`) => `Promise`\<`void`\>

Defined in: [src/hardhatHelpers.ts:10](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/hardhatHelpers.ts#L10)

Modifies the bytecode stored at an account's address.

## Parameters

### address

`string`

The address where the given code should be stored.

### code

`string`

The code to store (as a hex string).

## Returns

`Promise`\<`void`\>

A promise that resolves once the code is set.

## Example

```ts
const { networkHelpers } = await hre.network.create();
await networkHelpers.setCode("0x123...", "0x6001600101...");
```
