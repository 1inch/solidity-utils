## CONTRACTS DEPLOYMENT

For automatic deployment, we use `make` and Makefiles. The Makefile manages the deployment and configuration of various smart contracts and helpers, including targets for installing dependencies, deploying contracts, and managing environment variables.

## QUICK START

1. Run `make install`
2. Create `.env` file with the following variables:
   - Set OPS_NETWORK (e.g., mainnet, goerli, unichain)
   - Set OPS_CHAIN_ID (use `make show-chain-config` to find the chain ID for your network)
   - Set OPS_REG_TYPE if using custom networks
   - Set other optional variables as needed
3. Run `make run`

## ENVIRONMENT VARIABLES

The Makefile supports loading environment variables from either `.env` or `.env.automation` based on the `OPS_LAUNCH_MODE` environment variable:
- If `OPS_LAUNCH_MODE=auto`, it loads `.env.automation`
- Otherwise, it loads `.env`

| Variable                   | Description                                         |
|----------------------------|-----------------------------------------------------|
| OPS_REG_TYPE               | Registration type (e.g., custom)                    |
| OPS_NETWORK                | Network name (e.g., mainnet, goerli) - REQUIRED     |
| OPS_CHAIN_ID               | Chain ID for the network - REQUIRED                 |
| OPS_ETHERSCAN_NETWORK_NAME | (Optional) Etherscan network name (e.g., mainnet)   |
| OPS_API_URL                | (Optional) Custom API URL for the network           |
| OPS_BROWSER_URL            | (Optional) Custom browser URL for the network       |
| OPS_HARDFORK               | (Optional) Hardfork to use (e.g., london)           |
| OPS_L1_NETWORK             | (Optional) L1 network name                          |

### Example of .env file for custom network config:

```env
OPS_REG_TYPE=custom
OPS_NETWORK=unichain
OPS_CHAIN_ID=130
OPS_ETHERSCAN_NETWORK_NAME=
OPS_API_URL=https://api.uniscan.xyz/api
OPS_BROWSER_URL=https://uniscan.xyz/
OPS_HARDFORK=shanghai
OPS_L1_NETWORK=
```

### Example of .env file for mainnet:

```env
OPS_REG_TYPE=
OPS_NETWORK=mainnet
OPS_CHAIN_ID=1
OPS_ETHERSCAN_NETWORK_NAME=mainnet
OPS_API_URL=
OPS_BROWSER_URL=
OPS_HARDFORK=
OPS_L1_NETWORK=
```

## MAKEFILE TARGETS

Here is a list of Makefile targets you can use by running `make <target-name>` in the terminal:

- `install` - Installs utilities and project dependencies (runs install-utils and install-dependencies).
- `install-utils` - Installs required system utilities (yarn, wget) using Homebrew.
- `install-dependencies` - Installs project dependencies using yarn.
- `run` - Runs the setup for the specified network. Validates that OPS_NETWORK and OPS_CHAIN_ID are set, then updates network configuration and increments version.
- `show-chain-config` - Downloads chain configuration from Hardhat and ChainList to help find the chain ID for your network.
- `update-networks` - Adds the specified network configuration to hardhat-setup/networks.ts if it doesn't already exist.
- `update-ver` - Increments the minor version in package.json using npm version minor.
- `help` - Shows all available make targets with descriptions.

## NETWORK CONFIGURATION

The Makefile automatically generates network registration code based on your environment variables:

For standard networks:
```typescript
this.register("networkName", chainId, process.env.NETWORKNAME_RPC_URL, process.env.NETWORKNAME_PRIVATE_KEY || privateKey, process.env.NETWORKNAME_ETHERSCAN_KEY);
```

For custom networks:
```typescript
this.registerCustom("networkName", chainId, process.env.NETWORKNAME_RPC_URL, process.env.NETWORKNAME_PRIVATE_KEY || privateKey, process.env.NETWORKNAME_ETHERSCAN_KEY, "apiUrl", "browserUrl");
```

The environment variable names are automatically generated from the network name by converting to uppercase and replacing camelCase with underscores (e.g., `unichain` becomes `UNICHAIN_`, `baseMainnet` becomes `BASE_MAINNET_`).

## TODO 

- logging
- error handling
