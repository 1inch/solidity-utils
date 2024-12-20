# `Networks` Class

This class is your go-to assistant for setting up various blockchain networks for Hardhat setup. It provides convenient methods for create network objects, managing Etherscan keys for contract verifications, and configuring Hardhat networks, including hardhat forking.

## Key Components:
1. **`networks` Property**: Stores configurations for all registered networks.
2. **`etherscan` Property**: Keeps Etherscan API keys for all registered networks for contract verify process with Etherscan explorers.

## Methods:

1. **`constructor(useHardhat: boolean, forkingNetworkName?: string, saveHardhatDeployments: boolean, forkingAccounts?: HardhatNetworkAccountsUserConfig)`**: Initializes the class. It can set up a Hardhat network, including Hardhad forking, and determines whether to save deployments files.

   **Constructor Parameters**

    - **`useHardhat`** (default: `true`):

      Determines whether to configure the class for using the Hardhat network. If `true`, sets up the class to operate with Hardhat.

    - **`forkingNetworkName`** (optional):

      Specifies the network to fork in Hardhat. If provided, Hardhat will simulate the specified network, allowing for local testing and development. If not provided, Hardhat will not perform any network forking.

    - **`saveHardhatDeployments`** (default: `false`):

      Decides whether to save deployment files in the Hardhat environment. If `true`, saves deployment details such as contract addresses in json file, useful for tracking and referencing in subsequent testing or deployments.

    - **`forkingAccounts`** (optional):

      Specifies the configuration for accounts used during Hardhat network forking. If provided, it allows customization of private keys, balances, and other account properties for the forked network simulation. If omitted, default accounts will be used.

2. **`register(...)`**: Registers a new network with specified parameters, such as the RPC URL, private key, and Etherscan keys.

3. **`registerCustom(...)`**: Allows registering custom networks with custom parameters for Etherscan contract verifications.

5. **`registerAll()`**: Registers multiple standard networks using environment variables for configuration.

## Predefined environment variable names and their format
1. **`rpc`**

   `<NETWORK_NAME>_RPC_URL` - RPC configuration string of network with `<NETWORK_NAME>`.

   Format:
   - `<RPC_URL>` or `<RPC_URL>|<AUTH_KEY_HTTP_HEADER>`
   where `<RPC_URL>` is blockchain node node, `<AUTH_KEY_HTTP_HEADER>` is HTTP `auth-key` header's value.
   - Examples:
     - For using simple node with only access by RPC URL
     `MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_API_KEY`
     - For using node with access by HTTP `auth-key` header
     `MAINNET_RPC_URL=http://localhost:1234|AUTH_KEY_HEADER_VALUE`

2. **`private key`**

   `PRIVATE_KEY` - The Common private key used for all networks.

   `<NETWORK_NAME>_PRIVATE_KEY>` - The private key used for the specific network with `<NETWORK_NAME>`.

   Format:
   - 32 bytes of the private key represented as a 64-character hex string without the 0x prefix
   - Examples:
     - `PRIVATE_KEY=f040ec294d83b8abf0803b713ebdac7e6ef8c104bd644a45d32114e7a210ce74`
     - `MAINNET_PRIVATE_KEY=f040ec294d83b8abf0803b713ebdac7e6ef8c104bd644a45d32114e7a210ce74`

3. **`etherscan key`**

   `<NETWORK_NAME>_ETHERSCAN_KEY` - The Etherscan's key to verify contracts for the specific network with `<NETWORK_NAME>`.

   Format:
   - Just a string with Etherscan API KEY
   - Example: `MAINNET_ETHERSCAN_KEY=UFAPYWUQYZMR1NTER4G0BKB52WIOE6LKD9`

4. **`eth network in zksync`**

   `ZKSYNC_LOCAL_ETH_NETWORK` - rpc or name of ethNetwork for local zksync node.

   Format:
   - ethNetwork name (for mainnet or testnet) or rpc for custom eth node
   - Example: `ZKSYNC_LOCAL_ETH_NETWORK=http://localhost:8545`
   - Default value: `http://localhost:8545`

## Example Usage:
```javascript
// hardhat.config.js
...
const networksConfig = new Networks();
networksConfig.register('mainnet', 1, 'https://mainnet.infura.io/v3/YOUR_API_KEY', 'YOUR_PRIVATE_KEY', 'mainnet', 'YOUR_ETHERSCAN_API_KEY');

...

module.exports = {
    solidity: { ... }
    networks: networksConfig.networks,
    etherscan: networksConfig.etherscan,
    ...
}
```
This code creates a new instance of the Networks class and registers the Ethereum Mainnet network with your configuration data.
