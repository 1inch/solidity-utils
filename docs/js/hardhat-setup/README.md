[**@1inch/solidity-utils**](../README.md)

***

[@1inch/solidity-utils](../README.md) / hardhat-setup

# hardhat-setup

## Hardhat-Setup

- [~~HardhatNetworkAccountsUserConfig~~](type-aliases/HardhatNetworkAccountsUserConfig.md)

## Hardhat-Setup
A helper method to get the network name from the command line arguments.

- [getNetwork](functions/getNetwork.md)

## Hardhat-Setup
Configuration type for managing Etherscan integration in Hardhat setups.

- [Etherscan](type-aliases/Etherscan.md)

## Hardhat-Setup
Helper class to register networks and Etherscan API keys for Hardhat 3.
See the hardhat-setup README for environment variable formats and usage.

- [Networks](classes/Networks.md)

## Hardhat-Setup
Loads environment variables into process.env using the dotenv package.
By default, variables are loaded from a `.env` file in the project root.

- [loadEnv](functions/loadEnv.md)

## Hardhat-Setup
Parses an RPC configuration in `<RPC_URL>` or `<RPC_URL>|<AUTH_KEY_HTTP_HEADER>` format.

- [parseRpcEnv](functions/parseRpcEnv.md)

## Hardhat-Setup
Reset a Hardhat/EDR network to local state or to a fork.
Local network names (`hardhat`, `default`, and `hardhatMainnet`) are reset
without forking. Other names use `<NETWORK_NAME>_RPC_URL`.

- [resetHardhatNetworkFork](functions/resetHardhatNetworkFork.md)
