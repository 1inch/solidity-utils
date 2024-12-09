[**@1inch/solidity-utils**](../README.md) • **Docs**

***

[@1inch/solidity-utils](../README.md) / src

# src

## Index

### Other

- [NonceType](enumerations/NonceType.md)
- [SignedCallStruct](interfaces/SignedCallStruct.md)
- [constants](variables/constants.md)
- [DaiLikePermit](variables/DaiLikePermit.md)
- [defaultDeadline](variables/defaultDeadline.md)
- [defaultDeadlinePermit2](variables/defaultDeadlinePermit2.md)
- [EIP712Domain](variables/EIP712Domain.md)
- [Permit](variables/Permit.md)
- [TypedDataVersion](variables/TypedDataVersion.md)
- [buildBySigTraits](functions/buildBySigTraits.md)
- [hashBySig](functions/hashBySig.md)
- [signSignedCall](functions/signSignedCall.md)

### expect
Asserts that two values are roughly equal within a specified relative difference.
This function is useful for cases where precision issues might cause direct comparisons to fail.

- [assertRoughlyEqualValues](functions/assertRoughlyEqualValues.md)

### permit
Compresses a permit function call to a shorter format based on its type.
  Type         | EIP-2612 | DAI | Permit2
  Uncompressed |    224   | 256 | 352
  Compressed   |    100   |  72 | 96

- [compressPermit](functions/compressPermit.md)

### permit
Concatenates a target address with data, trimming the '0x' prefix from the data.

- [withTarget](functions/withTarget.md)

### permit
Constructs structured data for EIP-2612 permit function, including types, domain, and message with details about the permit.

- [buildData](functions/buildData.md)

### permit
Creates a permit for spending tokens on Permit2 standard contracts.

- [getPermit2](functions/getPermit2.md)

### permit
Decompresses a compressed permit function call back to its original full format.

- [decompressPermit](functions/decompressPermit.md)

### permit
Ensures contract code is set for a given address and returns a contract instance.

- [permit2Contract](functions/permit2Contract.md)

### permit
Generates a Dai-like permit signature for tokens.

- [getPermitLikeDai](functions/getPermitLikeDai.md)

### permit
Generates a ERC-7597 permit signature for tokens.

- [getPermitLikeUSDC](functions/getPermitLikeUSDC.md)

### permit
Generates a domain separator for EIP-712 structured data using the provided parameters.

- [domainSeparator](functions/domainSeparator.md)

### permit
Generates a permit signature for ERC20 tokens with EIP-2612 standard.

- [getPermit](functions/getPermit.md)

### permit
Prepares structured data similar to the Dai permit function, including types, domain, and message with permit details.

- [buildDataLikeDai](functions/buildDataLikeDai.md)

### permit
Removes the '0x' prefix from a string. If no '0x' prefix is found, returns the original string.

- [trim0x](functions/trim0x.md)

### permit
Trims the method selector from transaction data, removing the first 8 characters (4 bytes of hexable string) after '0x' prefix.

- [cutSelector](functions/cutSelector.md)

### prelude
Converts an Ether amount represented as a string into its Wei equivalent as a bigint.

- [ether](functions/ether.md)

### profileEVM
Default configuration options for the `gasspectEVM` function to analyze gas usage in EVM transactions.

- [gasspectOptionsDefault](variables/gasspectOptionsDefault.md)

### profileEVM
Performs gas analysis on EVM transactions, highlighting operations that exceed a specified gas cost.
Analyzes gas usage by operations within a transaction, applying filters and formatting based on options.

- [gasspectEVM](functions/gasspectEVM.md)

### profileEVM
Profiles EVM execution by counting occurrences of specified instructions in a transaction's execution trace.

- [profileEVM](functions/profileEVM.md)

### utils
Advances the blockchain time to a specific timestamp for testing purposes.

- [timeIncreaseTo](functions/timeIncreaseTo.md)

### utils
Corrects the ECDSA signature 'v' value according to Ethereum's standard.

- [fixSignature](functions/fixSignature.md)

### utils
Counts the occurrences of specified EVM instructions in a transaction's execution trace.

- [countInstructions](functions/countInstructions.md)

### utils
Deploys a contract from bytecode, useful for testing and deployment of minimal proxies.

- [deployContractFromBytecode](functions/deployContractFromBytecode.md)

### utils
Deploys a contract given a name and optional constructor parameters.

- [deployContract](functions/deployContract.md)

### utils
Deploys a contract using create3 and saves the deployment information.

- [deployAndGetContractWithCreate3](functions/deployAndGetContractWithCreate3.md)

### utils
Deploys a contract with optional Etherscan verification.

- [deployAndGetContract](functions/deployAndGetContract.md)

### utils
Options for deployment methods with create3. This is an extension of DeployContractOptions without `deployer` and `skipIfAlreadyDeployed`.

- [DeployContractOptionsWithCreate3](interfaces/DeployContractOptionsWithCreate3.md)

### utils
Options for deployment methods.

- [DeployContractOptions](interfaces/DeployContractOptions.md)

### utils
Represents a tuple containing a token quantity and either a transaction receipt or a recursive instance of the same tuple type.
This type is used in `trackReceivedTokenAndTx` method to track token transfers and their transaction receipts in a nested structure,
allowing for handling of complex scenarios like chained or batched transactions and tracking several tokens.
 - `result[0]`: The amount of the token received.
 - `result[1]`: The transaction receipt or another nested token tracking result.

- [TrackReceivedTokenAndTxResult](type-aliases/TrackReceivedTokenAndTxResult.md)

### utils
Represents the interface for a token, providing methods to fetch its balance and address.
This type is used in `trackReceivedTokenAndTx` method.

- [Token](type-aliases/Token.md)

### utils
Retrieves the current USD price of ETH or another specified native token.
This helper function is designed for use in test environments to maintain stability against market fluctuations.
It fetches the current price of ETH (or a specified native token for side chains) in USD from the Coinbase API to
ensure that tests remain stable and unaffected by significant market price fluctuations when token price is
important part of test.

- [getEthPrice](functions/getEthPrice.md)

### utils
Saves the deployment information using the deploy transaction hash.

- [saveContractWithCreate3Deployment](functions/saveContractWithCreate3Deployment.md)

### utils
Signs a message with a given signer and fixes the signature format.

- [signMessage](functions/signMessage.md)

### utils
Tracks token balance changes and transaction receipts for specified wallet addresses during test scenarios.
It could be used recursively for multiple tokens via specific `txPromise` function.

- [trackReceivedTokenAndTx](functions/trackReceivedTokenAndTx.md)
