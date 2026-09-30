[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / loadFixture

# Variable: loadFixture

> `const` **loadFixture**: \<`T`\>(`fixture`) => `Promise`\<`T`\>

Defined in: [src/hardhatHelpers.ts:9](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/src/hardhatHelpers.ts#L9)

Loads a fixture and restores the blockchain to a snapshot state for repeated tests.

The `loadFixture` function is useful in tests where you need to set up the blockchain to a desired state
(like deploying contracts, minting tokens, etc.) and then run multiple tests based on that state.

It executes the given fixture function, which should set up the blockchain state, and takes a snapshot of the blockchain.
On subsequent calls to `loadFixture` with the same fixture function, the blockchain is restored to that snapshot
rather than executing the fixture function again.

### Important:
**Do not pass anonymous functions** as the fixture function. Passing an anonymous function like
`loadFixture(async () => { ... })` will bypass the snapshot mechanism and result in the fixture being executed
each time. Instead, always pass a named function, like `loadFixture(deployTokens)`.

## Type Parameters

### T

`T`

## Parameters

### fixture

`Fixture`\<`T`, `"generic"`\>

A named asynchronous function that sets up the desired blockchain state and returns the fixture's data.

## Returns

`Promise`\<`T`\>

A promise that resolves to the data returned by the fixture, either from execution or a restored snapshot.

## Example

```ts
async function setupContracts() { ... }
const fixtureData = await loadFixture(setupContracts);
```
