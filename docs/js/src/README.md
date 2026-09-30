[**@1inch/solidity-utils**](../README.md)

***

[@1inch/solidity-utils](../README.md) / src

# src

## expect
Asserts that two values are roughly equal within a specified relative difference.
This function is useful for cases where precision issues might cause direct comparisons to fail.

- [assertRoughlyEqualValues](functions/assertRoughlyEqualValues.md)

## Other

- [NonceType](enumerations/NonceType.md)
- [SignedCallStruct](interfaces/SignedCallStruct.md)
- [constants](variables/constants.md)
- [DaiLikePermit](variables/DaiLikePermit.md)
- [defaultDeadline](variables/defaultDeadline.md)
- [defaultDeadlinePermit2](variables/defaultDeadlinePermit2.md)
- [EIP712Domain](variables/EIP712Domain.md)
- [ethers](variables/ethers.md)
- [loadFixture](variables/loadFixture.md)
- [Permit](variables/Permit.md)
- [PERMIT2\_ADDRESS\_ZKSYNC](variables/PERMIT2_ADDRESS_ZKSYNC.md)
- [setCode](variables/setCode.md)
- [time](variables/time.md)
- [TypedDataVersion](variables/TypedDataVersion.md)
- [buildBySigTraits](functions/buildBySigTraits.md)
- [hashBySig](functions/hashBySig.md)
- [signSignedCall](functions/signSignedCall.md)

## permit
Compresses a permit function call to a shorter format based on its type.
  Type         | EIP-2612 | DAI | Permit2
  Uncompressed |    224   | 256 | 352
  Compressed   |    100   |  72 | 96

- [compressPermit](functions/compressPermit.md)

## permit
Concatenates a target address with data, trimming the '0x' prefix from the data.

- [withTarget](functions/withTarget.md)

## permit
Constructs structured data for EIP-2612 permit function, including types, domain, and message with details about the permit.

- [buildData](functions/buildData.md)

## permit
Creates a permit for spending tokens on Permit2 standard contracts.

- [getPermit2](functions/getPermit2.md)

## permit
Decompresses a compressed permit function call back to its original full format.

- [decompressPermit](functions/decompressPermit.md)

## permit
Ensures contract code is set for a given address and returns a contract instance.

- [permit2Contract](functions/permit2Contract.md)

## permit
Generates a Dai-like permit signature for tokens.

- [getPermitLikeDai](functions/getPermitLikeDai.md)

## permit
Generates a domain separator for EIP-712 structured data using the provided parameters.

- [domainSeparator](functions/domainSeparator.md)

## permit
Generates a ERC-7597 permit signature for tokens.

- [getPermitLikeUSDC](functions/getPermitLikeUSDC.md)

## permit
Generates a permit signature for ERC20 tokens with EIP-2612 standard.

- [getPermit](functions/getPermit.md)

## permit
Prepares structured data similar to the Dai permit function, including types, domain, and message with permit details.

- [buildDataLikeDai](functions/buildDataLikeDai.md)

## permit
Removes the '0x' prefix from a string. If no '0x' prefix is found, returns the original string.

- [trim0x](functions/trim0x.md)

## permit
Returns the Permit2 contract address for the specified chain.

- [permit2Address](functions/permit2Address.md)

## permit
Trims the method selector from transaction data, removing the first 8 characters (4 bytes of hexable string) after '0x' prefix.

- [cutSelector](functions/cutSelector.md)

## prelude
Converts an Ether amount represented as a string into its Wei equivalent as a bigint.

- [ether](functions/ether.md)

## profileEVM
Default configuration options for the `gasspectEVM` function to analyze gas usage in EVM transactions.

- [gasspectOptionsDefault](variables/gasspectOptionsDefault.md)

## profileEVM
Measures pure execution gas of a transaction using `debug_traceTransaction`.
Unlike `receipt.gasUsed`, this excludes intrinsic gas overhead (21000 base + calldata costs),
giving a cleaner comparison of contract execution costs.

- [executionGas](functions/executionGas.md)

## profileEVM
Performs gas analysis on EVM transactions, highlighting operations that exceed a specified gas cost.
Analyzes gas usage by operations within a transaction, applying filters and formatting based on options.

- [gasspectEVM](functions/gasspectEVM.md)

## profileEVM
Profiles EVM execution by counting occurrences of specified instructions in a transaction's execution trace.

- [profileEVM](functions/profileEVM.md)

## utils

- [DeploymentRecord](type-aliases/DeploymentRecord.md)
- [TrackReceivedTokenAndTxResult](type-aliases/TrackReceivedTokenAndTxResult.md)

## utils
Advances the blockchain time to a specific timestamp for testing purposes.

- [timeIncreaseTo](functions/timeIncreaseTo.md)

## utils
Corrects the ECDSA signature 'v' value according to Ethereum's standard.
Geth returns 27 or 28, while some clients return 0 or 1. Values below 27 are
shifted to prevent signature malleability caused by mixed representations.

- [fixSignature](functions/fixSignature.md)

## utils
Counts occurrences of EVM instructions in a transaction trace.

- [countInstructions](functions/countInstructions.md)

## utils
Deploys a contract directly from its ABI and bytecode.
This is useful for tests and for bytecode without a named Hardhat artifact.

- [deployContractFromBytecode](functions/deployContractFromBytecode.md)

## utils
Deploys a contract given a name and optional constructor parameters.

- [deployContract](functions/deployContract.md)

## utils
Deploys a contract through CREATE3 and optionally persists the deployment in Rocketh.

- [deployAndGetContractWithCreate3](functions/deployAndGetContractWithCreate3.md)

## utils
Deploys a contract, optionally persists it in Rocketh, and verifies it on a block explorer.
Existing records are reused when `skipIfAlreadyDeployed` is enabled.

- [deployAndGetContract](functions/deployAndGetContract.md)

## utils
Options for create3 deployment methods.

- [DeployContractOptionsWithCreate3](interfaces/DeployContractOptionsWithCreate3.md)

## utils
Options for deployment methods.

- [DeployContractOptions](interfaces/DeployContractOptions.md)

## utils
Retrieves the current USD spot price of a native token from Coinbase.
Intended for tests that need a current reference price while preserving bigint precision.

- [getEthPrice](functions/getEthPrice.md)

## utils
Saves the deployment information using the deploy transaction hash.
The contract address is derived from the CREATE3 deployer and salt.

- [saveContractWithCreate3Deployment](functions/saveContractWithCreate3Deployment.md)

## utils
Sets custom bytecode for local test accounts and returns them as signers.
This is useful when EIP-7702 or another fixture leaves code on default accounts
and a test requires empty or explicitly controlled account bytecode.

- [getAccountsWithCode](functions/getAccountsWithCode.md)

## utils
Signs a message with a given signer and fixes the signature format.

- [signMessage](functions/signMessage.md)

## utils
Token interface for trackReceivedTokenAndTx.

- [Token](type-aliases/Token.md)

## utils
Tracks the amount of ERC-20 tokens or native currency received while executing a transaction.
Calls can be nested by returning another `TrackReceivedTokenAndTxResult` from `txPromise`.
Native-currency transaction fees are added back when the tracked wallet sends the transaction.

- [trackReceivedTokenAndTx](functions/trackReceivedTokenAndTx.md)
