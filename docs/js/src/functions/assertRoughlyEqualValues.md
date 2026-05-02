[**@1inch/solidity-utils**](../../README.md) • **Docs**

***

[@1inch/solidity-utils](../../README.md) / [src](../README.md) / assertRoughlyEqualValues

# Function: assertRoughlyEqualValues()

> **assertRoughlyEqualValues**(`expected`, `actual`, `relativeDiff`): `void`

## Parameters

• **expected**: `string` \| `number` \| `bigint`

The expected value as a string, number, or bigint.

• **actual**: `string` \| `number` \| `bigint`

The actual value obtained, to compare against the expected value.

• **relativeDiff**: `number`

The maximum allowed relative difference between the expected and actual values.
The relative difference is calculated as the absolute difference divided by the expected value,
ensuring that the actual value is within this relative difference from the expected value.

## Returns

`void`

## Remarks

This function will revert with a message if the values are of different signs
or if the actual value deviates from the expected by more than the specified relative difference.

## Defined in

[src/expect.ts:16](https://github.com/1inch/solidity-utils/blob/e55abfe68c10404192d68f588ca6478bef617d94/src/expect.ts#L16)
