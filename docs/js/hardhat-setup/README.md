[**@1inch/solidity-utils**](../README.md) • **Docs**

***

[@1inch/solidity-utils](../README.md) / hardhat-setup

# hardhat-setup

## Index

### Hardhat-Setup
A helper method to get the network name from the command line arguments.

- [getNetwork](functions/getNetwork.md)

### Hardhat-Setup
A helper method to parse RPC configuration strings. Checks that the string is in the expected format.

- [parseRpcEnv](functions/parseRpcEnv.md)

### Hardhat-Setup
A helper method to reset the Hardhat network to the local network or to a fork.

- [resetHardhatNetworkFork](functions/resetHardhatNetworkFork.md)

### Hardhat-Setup
Configuration type for managing Etherscan integration in Hardhat setups.

- [Etherscan](type-aliases/Etherscan.md)

### Hardhat-Setup
Loads environment variables into process.env using the dotenv package.
By default, loads variables from a `.env` file in the project root.
You can provide custom options (e.g. a different path or encoding) via the `options` parameter.

- [loadEnv](functions/loadEnv.md)

### Hardhat-Setup
The Network class is a helper class to register networks and Etherscan API keys.
See the [README](https://github.com/1inch/solidity-utils/tree/master/hardhat-setup/README.md) for usage.

- [Networks](classes/Networks.md)
