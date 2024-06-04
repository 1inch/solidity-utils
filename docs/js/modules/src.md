[@1inch/solidity-utils](../README.md) / [Modules](../modules.md) / src

# Module: src

## Table of contents

### Enumerations

- [NonceType](../enums/src.NonceType.md)

### Interfaces

- [DeployContractOptions](../interfaces/src.DeployContractOptions.md)
- [SignedCallStruct](../interfaces/src.SignedCallStruct.md)

### Type Aliases

- [Token](src.md#token)
- [TrackReceivedTokenAndTxResult](src.md#trackreceivedtokenandtxresult)

### Variables

- [DaiLikePermit](src.md#dailikepermit)
- [EIP712Domain](src.md#eip712domain)
- [Permit](src.md#permit)
- [TypedDataVersion](src.md#typeddataversion)
- [constants](src.md#constants)
- [defaultDeadline](src.md#defaultdeadline)
- [defaultDeadlinePermit2](src.md#defaultdeadlinepermit2)
- [gasspectOptionsDefault](src.md#gasspectoptionsdefault)

### Functions

- [assertRoughlyEqualValues](src.md#assertroughlyequalvalues)
- [buildBySigTraits](src.md#buildbysigtraits)
- [buildData](src.md#builddata)
- [buildDataLikeDai](src.md#builddatalikedai)
- [compressPermit](src.md#compresspermit)
- [countInstructions](src.md#countinstructions)
- [cutSelector](src.md#cutselector)
- [decompressPermit](src.md#decompresspermit)
- [deployAndGetContract](src.md#deployandgetcontract)
- [deployContract](src.md#deploycontract)
- [deployContractFromBytecode](src.md#deploycontractfrombytecode)
- [domainSeparator](src.md#domainseparator)
- [ether](src.md#ether)
- [fixSignature](src.md#fixsignature)
- [gasspectEVM](src.md#gasspectevm)
- [getEthPrice](src.md#getethprice)
- [getPermit](src.md#getpermit)
- [getPermit2](src.md#getpermit2)
- [getPermitLikeDai](src.md#getpermitlikedai)
- [getPermitLikeUSDC](src.md#getpermitlikeusdc)
- [hashBySig](src.md#hashbysig)
- [permit2Contract](src.md#permit2contract)
- [profileEVM](src.md#profileevm)
- [signMessage](src.md#signmessage)
- [signSignedCall](src.md#signsignedcall)
- [timeIncreaseTo](src.md#timeincreaseto)
- [trackReceivedTokenAndTx](src.md#trackreceivedtokenandtx)
- [trim0x](src.md#trim0x)
- [withTarget](src.md#withtarget)

## Other

### DaiLikePermit

• `Const` **DaiLikePermit**: \{ `name`: `string` = 'holder'; `type`: `string` = 'address' }[]

#### Defined in

[src/permit.ts:30](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L30)

___

### EIP712Domain

• `Const` **EIP712Domain**: \{ `name`: `string` = 'name'; `type`: `string` = 'string' }[]

#### Defined in

[src/permit.ts:15](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L15)

___

### Permit

• `Const` **Permit**: \{ `name`: `string` = 'owner'; `type`: `string` = 'address' }[]

#### Defined in

[src/permit.ts:22](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L22)

___

### TypedDataVersion

• `Const` **TypedDataVersion**: `V4` = `SignTypedDataVersion.V4`

#### Defined in

[src/permit.ts:11](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L11)

___

### constants

• `Const` **constants**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `DEV_CHAINS` | `string`[] |
| `EEE_ADDRESS` | ``"0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"`` |
| `MAX_INT256` | `bigint` |
| `MAX_UINT128` | `bigint` |
| `MAX_UINT256` | `bigint` |
| `MAX_UINT32` | `bigint` |
| `MAX_UINT48` | `bigint` |
| `MIN_INT256` | `bigint` |
| `ZERO_ADDRESS` | ``"0x0000000000000000000000000000000000000000"`` |
| `ZERO_BYTES32` | ``"0x0000000000000000000000000000000000000000000000000000000000000000"`` |

#### Defined in

[src/prelude.ts:4](https://github.com/1inch/solidity-utils/blob/dc69769/src/prelude.ts#L4)

___

### defaultDeadline

• `Const` **defaultDeadline**: `bigint` = `constants.MAX_UINT256`

#### Defined in

[src/permit.ts:12](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L12)

___

### defaultDeadlinePermit2

• `Const` **defaultDeadlinePermit2**: `bigint` = `constants.MAX_UINT48`

#### Defined in

[src/permit.ts:13](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L13)

___

### buildBySigTraits

▸ **buildBySigTraits**(`«destructured»?`): `bigint`

Builds traits for {bySig} contract by combining params.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `«destructured»` | `Object` | `{}` |
| › `deadline` | `undefined` \| `number` | `0` |
| › `nonce` | `undefined` \| `number` | `0` |
| › `nonceType` | `undefined` \| [`NonceType`](../enums/src.NonceType.md) | `NonceType.Account` |
| › `relayer` | `undefined` \| `string` | `undefined` |

#### Returns

`bigint`

A bigint representing the combined traits.

**`Throws`**

Error if provided with invalid parameters.

#### Defined in

[src/bySig.ts:24](https://github.com/1inch/solidity-utils/blob/dc69769/src/bySig.ts#L24)

___

### hashBySig

▸ **hashBySig**(`name`, `version`, `chainId`, `verifyingContract`, `sig`): `string`

Computes the EIP-712 hash for a given bySig call.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The user readable name of EIP-712 domain. |
| `version` | `string` | The version of the EIP-712 domain. |
| `chainId` | `bigint` | The unique identifier for the blockchain network. |
| `verifyingContract` | `string` | The Ethereum address of the contract that will verify the signature. This ties the signature to a specific contract. |
| `sig` | [`SignedCallStruct`](../interfaces/src.SignedCallStruct.md) | The data to be signed. |

#### Returns

`string`

The EIP-712 hash of the fully encoded data.

#### Defined in

[src/bySig.ts:63](https://github.com/1inch/solidity-utils/blob/dc69769/src/bySig.ts#L63)

___

### signSignedCall

▸ **signSignedCall**(`name`, `version`, `chainId`, `verifyingContract`, `signer`, `signedCall`): `Promise`\<`string`\>

Signs a given data for {bySig} contract call using EIP-712 standard.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The user readable name of EIP-712 domain. |
| `version` | `string` | The version of the EIP-712 domain. |
| `chainId` | `string` \| `bigint` | The unique identifier for the blockchain network. |
| `verifyingContract` | `string` | The Ethereum address of the contract that will verify the signature. This ties the signature to a specific contract. |
| `signer` | `Wallet` \| `HardhatEthersSigner` | The wallet or signer to sign the data. |
| `signedCall` | [`SignedCallStruct`](../interfaces/src.SignedCallStruct.md) | The call data to be signed, consisting of traits and data. |

#### Returns

`Promise`\<`string`\>

A Promise that resolves to the signature.

#### Defined in

[src/bySig.ts:84](https://github.com/1inch/solidity-utils/blob/dc69769/src/bySig.ts#L84)

## expect

### assertRoughlyEqualValues

▸ **assertRoughlyEqualValues**(`expected`, `actual`, `relativeDiff`): `void`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `expected` | `string` \| `number` \| `bigint` | The expected value as a string, number, or bigint. |
| `actual` | `string` \| `number` \| `bigint` | The actual value obtained, to compare against the expected value. |
| `relativeDiff` | `number` | The maximum allowed relative difference between the expected and actual values. The relative difference is calculated as the absolute difference divided by the expected value, ensuring that the actual value is within this relative difference from the expected value. |

#### Returns

`void`

**`Dev`**

Asserts that two values are roughly equal within a specified relative difference.
This function is useful for cases where precision issues might cause direct comparisons to fail.

**`Notice`**

This function will revert with a message if the values are of different signs
or if the actual value deviates from the expected by more than the specified relative difference.

#### Defined in

[src/expect.ts:15](https://github.com/1inch/solidity-utils/blob/dc69769/src/expect.ts#L15)

## permit

### buildData

▸ **buildData**(`name`, `version`, `chainId`, `verifyingContract`, `owner`, `spender`, `value`, `nonce`, `deadline?`): `Object`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The user readable name of signing EIP-712 domain |
| `version` | `string` | The version of the signing EIP-712 domain. |
| `chainId` | `number` | The unique identifier for the blockchain network. |
| `verifyingContract` | `string` | The Ethereum address of the contract that will verify the signature. This ties the signature to a specific contract. |
| `owner` | `string` | The Ethereum address of the token owner granting permission to spend tokens on their behalf. |
| `spender` | `string` | The Ethereum address of the party being granted permission to spend tokens on behalf of the owner. |
| `value` | `string` | The amount of tokens the spender is permitted to spend. |
| `nonce` | `string` | An arbitrary number used once to prevent replay attacks. Typically, this is the number of transactions sent by the owner. |
| `deadline` | `string` | The timestamp until which the permit is valid. This provides a window of time in which the permit can be used. |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `domain` | \{ `chainId`: `number` ; `name`: `string` ; `verifyingContract`: `string` ; `version`: `string`  } |
| `domain.chainId` | `number` |
| `domain.name` | `string` |
| `domain.verifyingContract` | `string` |
| `domain.version` | `string` |
| `message` | \{ `deadline`: `string` ; `nonce`: `string` ; `owner`: `string` ; `spender`: `string` ; `value`: `string`  } |
| `message.deadline` | `string` |
| `message.nonce` | `string` |
| `message.owner` | `string` |
| `message.spender` | `string` |
| `message.value` | `string` |
| `types` | \{ `Permit`: \{ `name`: `string` = 'owner'; `type`: `string` = 'address' }[]  } |
| `types.Permit` | \{ `name`: `string` = 'owner'; `type`: `string` = 'address' }[] |

**`Dev`**

Constructs structured data for EIP-2612 permit function, including types, domain, and message with details about the permit.

#### Defined in

[src/permit.ts:97](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L97)

___

### buildDataLikeDai

▸ **buildDataLikeDai**(`name`, `version`, `chainId`, `verifyingContract`, `holder`, `spender`, `nonce`, `allowed`, `expiry?`): `Object`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The user readable name of signing EIP-712 domain |
| `version` | `string` | The version of the signing EIP-712 domain. |
| `chainId` | `number` | The unique identifier for the blockchain network. |
| `verifyingContract` | `string` | The Ethereum address of the contract that will verify the signature. This ties the signature to a specific contract. |
| `holder` | `string` | The address of the token holder who is giving permission, establishing the source of the funds. |
| `spender` | `string` | The address allowed to spend tokens on behalf of the holder, essentially the recipient of the permit. |
| `nonce` | `string` | An arbitrary number used once to prevent replay attacks. Typically, this is the number of transactions sent by the owner. |
| `allowed` | `boolean` | A boolean indicating whether the spender is allowed to spend the tokens, providing a clear permit status. |
| `expiry` | `string` | The time until which the permit is valid, offering a window during which the spender can use the permit. |

#### Returns

`Object`

Structured data prepared for a Dai-like permit function.

| Name | Type |
| :------ | :------ |
| `domain` | \{ `chainId`: `number` ; `name`: `string` ; `verifyingContract`: `string` ; `version`: `string`  } |
| `domain.chainId` | `number` |
| `domain.name` | `string` |
| `domain.verifyingContract` | `string` |
| `domain.version` | `string` |
| `message` | \{ `allowed`: `boolean` ; `expiry`: `string` ; `holder`: `string` ; `nonce`: `string` ; `spender`: `string`  } |
| `message.allowed` | `boolean` |
| `message.expiry` | `string` |
| `message.holder` | `string` |
| `message.nonce` | `string` |
| `message.spender` | `string` |
| `types` | \{ `Permit`: \{ `name`: `string` = 'holder'; `type`: `string` = 'address' }[] = DaiLikePermit } |
| `types.Permit` | \{ `name`: `string` = 'holder'; `type`: `string` = 'address' }[] |

**`Dev`**

Prepares structured data similar to the Dai permit function, including types, domain, and message with permit details.

#### Defined in

[src/permit.ts:129](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L129)

___

### compressPermit

▸ **compressPermit**(`permit`): `string`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `permit` | `string` | The full permit function call string. |

#### Returns

`string`

A compressed permit string.

**`Notice`**

Compresses a permit function call to a shorter format based on its type.
  Type         | EIP-2612 | DAI | Permit2
  Uncompressed |    224   | 256 | 352
  Compressed   |    100   |  72 | 96

#### Defined in

[src/permit.ts:352](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L352)

___

### cutSelector

▸ **cutSelector**(`data`): `string`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `string` | The transaction data string from which to trim the selector. |

#### Returns

`string`

The trimmed selector string.

**`Dev`**

Trims the method selector from transaction data, removing the first 8 characters (4 bytes of hexable string) after '0x' prefix.

#### Defined in

[src/permit.ts:58](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L58)

___

### decompressPermit

▸ **decompressPermit**(`permit`, `token`, `owner`, `spender`): `string`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `permit` | `string` | The compressed permit function call string. |
| `token` | `string` | The token address involved in the permit (for Permit2 type). |
| `owner` | `string` | The owner address involved in the permit. |
| `spender` | `string` | The spender address involved in the permit. |

#### Returns

`string`

The decompressed permit function call string.

**`Notice`**

Decompresses a compressed permit function call back to its original full format.

#### Defined in

[src/permit.ts:401](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L401)

___

### domainSeparator

▸ **domainSeparator**(`name`, `version`, `chainId`, `verifyingContract`): `string`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The user readable name of EIP-712 domain. |
| `version` | `string` | The version of the EIP-712 domain. |
| `chainId` | `string` | The unique identifier for the blockchain network. |
| `verifyingContract` | `string` | The Ethereum address of the contract that will verify the signature. This ties the signature to a specific contract. |

#### Returns

`string`

The domain separator as a hex string.

**`Dev`**

Generates a domain separator for EIP-712 structured data using the provided parameters.

#### Defined in

[src/permit.ts:72](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L72)

___

### getPermit

▸ **getPermit**(`owner`, `permitContract`, `tokenVersion`, `chainId`, `spender`, `value`, `deadline?`, `compact?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `owner` | `Wallet` \| `HardhatEthersSigner` | `undefined` | The wallet or signer issuing the permit. |
| `permitContract` | `ERC20Permit` | `undefined` | The contract object with ERC20Permit type and token address for which the permit creating. |
| `tokenVersion` | `string` | `undefined` | The version of the token's EIP-712 domain. |
| `chainId` | `number` | `undefined` | The unique identifier for the blockchain network. |
| `spender` | `string` | `undefined` | The address allowed to spend the tokens. |
| `value` | `string` | `undefined` | The amount of tokens the spender is allowed to use. |
| `deadline` | `string` | `undefined` | Time until when the permit is valid. |
| `compact` | `boolean` | `false` | Indicates if the permit should be compressed. |

#### Returns

`Promise`\<`string`\>

A signed permit string.

**`Notice`**

Generates a permit signature for ERC20 tokens with EIP-2612 standard.

#### Defined in

[src/permit.ts:172](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L172)

___

### getPermit2

▸ **getPermit2**(`owner`, `token`, `chainId`, `spender`, `amount`, `compact?`, `expiration?`, `sigDeadline?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `owner` | `Wallet` \| `HardhatEthersSigner` | `undefined` | The wallet or signer issuing the permit. |
| `token` | `string` | `undefined` | The address of the token for which the permit is creates. |
| `chainId` | `number` | `undefined` | The unique identifier for the blockchain network. |
| `spender` | `string` | `undefined` | The address allowed to spend the tokens. |
| `amount` | `bigint` | `undefined` | The amount of tokens the spender is allowed to use. |
| `compact` | `boolean` | `false` | Indicates if the permit should be compressed. |
| `expiration` | `bigint` | `defaultDeadlinePermit2` | The time until when the permit is valid for Permit2. |
| `sigDeadline` | `bigint` | `defaultDeadlinePermit2` | Deadline for the signature to be considered valid. |

#### Returns

`Promise`\<`string`\>

A signed permit string specific to Permit2 contracts.

**`Notice`**

Creates a permit for spending tokens on Permit2 standard contracts.

#### Defined in

[src/permit.ts:214](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L214)

___

### getPermitLikeDai

▸ **getPermitLikeDai**(`holder`, `permitContract`, `tokenVersion`, `chainId`, `spender`, `allowed`, `expiry?`, `compact?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `holder` | `Wallet` \| `HardhatEthersSigner` | `undefined` | The wallet or signer issuing the permit. |
| `permitContract` | `DaiLikePermitMock` | `undefined` | The contract object with ERC20PermitLikeDai type and token address for which the permit creating. |
| `tokenVersion` | `string` | `undefined` | The version of the token's EIP-712 domain. |
| `chainId` | `number` | `undefined` | The unique identifier for the blockchain network. |
| `spender` | `string` | `undefined` | The address allowed to spend the tokens. |
| `allowed` | `boolean` | `undefined` | Boolean indicating whether the spender is allowed to spend. |
| `expiry` | `string` | `undefined` | Time until when the permit is valid. |
| `compact` | `boolean` | `false` | Indicates if the permit should be compressed. |

#### Returns

`Promise`\<`string`\>

A signed permit string in Dai-like format.

**`Notice`**

Generates a Dai-like permit signature for tokens.

#### Defined in

[src/permit.ts:256](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L256)

___

### getPermitLikeUSDC

▸ **getPermitLikeUSDC**(`owner`, `signer`, `permitContract`, `tokenVersion`, `chainId`, `spender`, `value`, `deadline?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `owner` | `string` | Contract with isValidSignature function. |
| `signer` | `Wallet` \| `HardhatEthersSigner` | The wallet or signer issuing the permit. |
| `permitContract` | `USDCLikePermitMock` | The contract object with ERC7597Permit type and token address for which the permit creating. |
| `tokenVersion` | `string` | The version of the token's EIP-712 domain. |
| `chainId` | `number` | The unique identifier for the blockchain network. |
| `spender` | `string` | The address allowed to spend the tokens. |
| `value` | `string` | The amount of tokens the spender is allowed to use. |
| `deadline` | `string` | Time until when the permit is valid. |

#### Returns

`Promise`\<`string`\>

A signed permit string in ERC7597Permit format.

**`Notice`**

Generates a ERC-7597 permit signature for tokens.

#### Defined in

[src/permit.ts:301](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L301)

___

### permit2Contract

▸ **permit2Contract**(): `Promise`\<`IPermit2`\>

#### Returns

`Promise`\<`IPermit2`\>

The contract instance of IPermit2.

**`Dev`**

Ensures contract code is set for a given address and returns a contract instance.

#### Defined in

[src/permit.ts:152](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L152)

___

### trim0x

▸ **trim0x**(`bigNumber`): `string`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bigNumber` | `string` \| `bigint` | The number (as a bigint or string) from which to remove the '0x' prefix. |

#### Returns

`string`

The string without the '0x' prefix.

**`Dev`**

Removes the '0x' prefix from a string. If no '0x' prefix is found, returns the original string.

#### Defined in

[src/permit.ts:44](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L44)

___

### withTarget

▸ **withTarget**(`target`, `data`): `string`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` \| `bigint` | The target address or value to prepend. |
| `data` | `string` \| `bigint` | The data string to be concatenated after trimming. |

#### Returns

`string`

A concatenated string of target and data.

**`Notice`**

Concatenates a target address with data, trimming the '0x' prefix from the data.

#### Defined in

[src/permit.ts:339](https://github.com/1inch/solidity-utils/blob/dc69769/src/permit.ts#L339)

## prelude

### ether

▸ **ether**(`n`): `bigint`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `n` | `string` | The amount of Ether to convert, specified as a string. |

#### Returns

`bigint`

The equivalent amount in Wei as a bigint.

**`Notice`**

Converts an Ether amount represented as a string into its Wei equivalent as a bigint.

#### Defined in

[src/prelude.ts:26](https://github.com/1inch/solidity-utils/blob/dc69769/src/prelude.ts#L26)

## profileEVM

### gasspectOptionsDefault

• `Const` **gasspectOptionsDefault**: `Object`

**`Dev`**

Default configuration options for the `gasspectEVM` function to analyze gas usage in EVM transactions.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `args` | `boolean` |
| `minOpGasCost` | `number` |
| `res` | `boolean` |

#### Defined in

[src/profileEVM.ts:11](https://github.com/1inch/solidity-utils/blob/dc69769/src/profileEVM.ts#L11)

___

### gasspectEVM

▸ **gasspectEVM**(`provider`, `txHash`, `gasspectOptions?`, `optionalTraceFile?`): `Promise`\<`string`[]\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `provider` | `JsonRpcProvider` \| \{ `send`: (`method`: `string`, `params`: `unknown`[]) => `Promise`\<`any`\>  } | The Ethereum JSON RPC provider or any custom provider with a `send` method. |
| `txHash` | `string` | Transaction hash to analyze. |
| `gasspectOptions` | `Record`\<`string`, `unknown`\> | Analysis configuration, specifying filters and formatting for gas analysis. See `gasspectOptionsDefault` for default values. |
| `optionalTraceFile?` | `PathLike` \| `FileHandle` | Optional path or handle to save the detailed transaction trace. |

#### Returns

`Promise`\<`string`[]\>

A detailed string array of operations meeting the criteria set in `gasspectOptions`.

**`Notice`**

Performs gas analysis on EVM transactions, highlighting operations that exceed a specified gas cost.
Analyzes gas usage by operations within a transaction, applying filters and formatting based on options.

#### Defined in

[src/profileEVM.ts:141](https://github.com/1inch/solidity-utils/blob/dc69769/src/profileEVM.ts#L141)

___

### profileEVM

▸ **profileEVM**(`provider`, `txHash`, `instruction`, `optionalTraceFile?`): `Promise`\<`number`[]\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `provider` | `JsonRpcProvider` \| \{ `send`: (`method`: `string`, `params`: `unknown`[]) => `Promise`\<`any`\>  } | An Ethereum provider capable of sending custom RPC requests. |
| `txHash` | `string` | The hash of the transaction to profile. |
| `instruction` | `string`[] | An array of EVM instructions (opcodes) to count within the transaction's execution trace. |
| `optionalTraceFile?` | `PathLike` \| `FileHandle` | An optional file path or handle where the full transaction trace will be saved. |

#### Returns

`Promise`\<`number`[]\>

An array of numbers representing the counts of each instruction specified, in the order they were provided.

**`Notice`**

Profiles EVM execution by counting occurrences of specified instructions in a transaction's execution trace.

#### Defined in

[src/profileEVM.ts:112](https://github.com/1inch/solidity-utils/blob/dc69769/src/profileEVM.ts#L112)

## utils

### TrackReceivedTokenAndTxResult

Ƭ **TrackReceivedTokenAndTxResult**: [`bigint`, `ContractTransactionReceipt` \| [`TrackReceivedTokenAndTxResult`](src.md#trackreceivedtokenandtxresult)]

**`Notice`**

Represents a tuple containing a token quantity and either a transaction receipt or a recursive instance of the same tuple type.
This type is used in `trackReceivedTokenAndTx` method to track token transfers and their transaction receipts in a nested structure,
allowing for handling of complex scenarios like chained or batched transactions and tracking several tokens.
 - result[0]: The amount of the token received.
 - result[1]: The transaction receipt or another nested token tracking result.

#### Defined in

[src/utils.ts:164](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L164)

___

### countInstructions

▸ **countInstructions**(`provider`, `txHash`, `instructions`): `Promise`\<`number`[]\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `provider` | `JsonRpcProvider` \| \{ `send`: (`method`: `string`, `params`: `unknown`[]) => `Promise`\<`any`\>  } | JSON RPC provider or custom provider object. |
| `txHash` | `string` | Transaction hash to analyze. |
| `instructions` | `string`[] | Array of EVM instructions (opcodes) to count. |

#### Returns

`Promise`\<`number`[]\>

Array of instruction counts.

**`Notice`**

Counts the occurrences of specified EVM instructions in a transaction's execution trace.

#### Defined in

[src/utils.ts:238](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L238)

___

### deployAndGetContract

▸ **deployAndGetContract**(`options`): `Promise`\<`Contract`\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`DeployContractOptions`](../interfaces/src.DeployContractOptions.md) | Deployment options. Default values: - deploymentName: contractName - skipVerify: false - skipIfAlreadyDeployed: true - log: true - waitConfirmations: 1 on dev chains, 6 on others |

#### Returns

`Promise`\<`Contract`\>

The deployed contract instance.

**`Notice`**

Deploys a contract with optional Etherscan verification.

#### Defined in

[src/utils.ts:53](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L53)

___

### deployContract

▸ **deployContract**(`name`, `parameters?`): `Promise`\<`BaseContract`\>

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `name` | `string` | `undefined` | The contract name. |
| `parameters` | `BigNumberish`[] | `[]` | Constructor parameters for the contract. |

#### Returns

`Promise`\<`BaseContract`\>

The deployed contract instance.

**`Notice`**

Deploys a contract given a name and optional constructor parameters.

#### Defined in

[src/utils.ts:120](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L120)

___

### deployContractFromBytecode

▸ **deployContractFromBytecode**(`abi`, `bytecode`, `parameters?`, `signer?`): `Promise`\<`BaseContract`\>

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `abi` | `any`[] | `undefined` | Contract ABI. |
| `bytecode` | `BytesLike` | `undefined` | Contract bytecode. |
| `parameters` | `BigNumberish`[] | `[]` | Constructor parameters. |
| `signer?` | `Signer` | `undefined` | Optional signer object. |

#### Returns

`Promise`\<`BaseContract`\>

The deployed contract instance.

**`Notice`**

Deploys a contract from bytecode, useful for testing and deployment of minimal proxies.

#### Defined in

[src/utils.ts:137](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L137)

___

### fixSignature

▸ **fixSignature**(`signature`): `string`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signature` | `string` | The original signature string. |

#### Returns

`string`

The corrected signature string.

**`Notice`**

Corrects the ECDSA signature 'v' value according to Ethereum's standard.

#### Defined in

[src/utils.ts:204](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L204)

___

### getEthPrice

▸ **getEthPrice**(`nativeTokenSymbol?`): `Promise`\<`bigint`\>

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `nativeTokenSymbol` | `string` | `'ETH'` | The symbol of the native token for which the price is being fetched, defaults to 'ETH'. |

#### Returns

`Promise`\<`bigint`\>

The price of the specified native token in USD, scaled by 1e18 to preserve precision.

**`Notice`**

Retrieves the current USD price of ETH or another specified native token.
This helper function is designed for use in test environments to maintain stability against market fluctuations.
It fetches the current price of ETH (or a specified native token for side chains) in USD from the Coinbase API to
ensure that tests remain stable and unaffected by significant market price fluctuations when token price is
important part of test.

#### Defined in

[src/utils.ts:263](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L263)

___

### signMessage

▸ **signMessage**(`signer`, `messageHex?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `signer` | `Wallet` \| \{ `signMessage`: (`messageHex`: `string` \| `Uint8Array`) => `Promise`\<`string`\>  } | `undefined` | Signer object or wallet instance. |
| `messageHex` | `string` \| `Uint8Array` | `'0x'` | The message to sign, in hex format. |

#### Returns

`Promise`\<`string`\>

The signed message string.

**`Notice`**

Signs a message with a given signer and fixes the signature format.

#### Defined in

[src/utils.ts:223](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L223)

___

### timeIncreaseTo

▸ **timeIncreaseTo**(`seconds`): `Promise`\<`void`\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `seconds` | `string` \| `number` | Target time in seconds or string format to increase to. |

#### Returns

`Promise`\<`void`\>

**`Notice`**

Advances the blockchain time to a specific timestamp for testing purposes.

#### Defined in

[src/utils.ts:107](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L107)

___

### trackReceivedTokenAndTx

▸ **trackReceivedTokenAndTx**\<`T`\>(`provider`, `token`, `wallet`, `txPromise`, `...args`): `Promise`\<[`TrackReceivedTokenAndTxResult`](src.md#trackreceivedtokenandtxresult)\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `unknown`[] |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `provider` | `JsonRpcProvider` \| \{ `getBalance`: (`address`: `string`) => `Promise`\<`bigint`\>  } | JSON RPC provider or custom provider object. |
| `token` | [`Token`](src.md#token) \| \{ `address`: ``"0x0000000000000000000000000000000000000000"``  } \| \{ `address`: ``"0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"``  } | Token contract instance or ETH address constants. |
| `wallet` | `string` | Wallet address to track. |
| `txPromise` | (...`args`: `T`) => `Promise`\<`ContractTransactionResponse` \| [`TrackReceivedTokenAndTxResult`](src.md#trackreceivedtokenandtxresult)\> | Function returning a transaction promise. |
| `...args` | `T` | Arguments for the transaction promise function. |

#### Returns

`Promise`\<[`TrackReceivedTokenAndTxResult`](src.md#trackreceivedtokenandtxresult)\>

Tuple of balance change and transaction receipt.

**`Notice`**

Tracks token balance changes and transaction receipts for specified wallet addresses during test scenarios.
It could be used recursively for multiple tokens via specific `txPromise` function.

#### Defined in

[src/utils.ts:177](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L177)

## utils
Represents the interface for a token, providing methods to fetch its balance and address.
This type is used in &#x60;trackReceivedTokenAndTx&#x60; method.

### Token

Ƭ **Token**: `Object`

**`Param`**

Method which retrieves the balance of the specified address.

**`Param`**

Method which retrieves the token contract's address.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `balanceOf` | (`address`: `string`) => `Promise`\<`bigint`\> |
| `getAddress` | () => `Promise`\<`string`\> |

#### Defined in

[src/utils.ts:151](https://github.com/1inch/solidity-utils/blob/dc69769/src/utils.ts#L151)
