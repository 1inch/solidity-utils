

## CONTRACTS DEPLOYMENT

For automatic deployment, we use `make` and Makefiles. The Makefile manages the deployment and configuration of various smart contracts and helpers, including targets for installing dependencies, deploying contracts, and managing environment variables.

## QUICK START

1. Run `make install`
2. Run `make env-example` → creates `.env.example`
3. Move `.env.example` to `.env` and fill in values. 
For getting OPS_CHAIN_ID you should fill in OPS_NETWORK value, and run `make show-chain-config`. Follow instructions in terminal.
For getting current OPS_VERSION you can use `make git-latest-tag`. Use this value to define the new OPS_VERSION.
4. **Optional only for local Hardhat node**: Run `NODE_RPC=[PUT_HERE_THE_RPC_URL_FOR_FORKING] make launch-hh-node`
5. Run `make run`
6. Run `make show-env` and follow instructions.
7. **Optional** Run `make git-checkout` for new branch creation
8. **Optional** RUN `make git-push` for pushing to origin

## ENVIRONMENT VARIABLES

| Variable                   | Description                                         |
|----------------------------|-----------------------------------------------------|
| OPS_REG_TYPE               | Registration type (e.g., custom)                    |
| OPS_NETWORK                | Network name (e.g., mainnet, goerli)                |
| OPS_CHAIN_ID               | Chain ID for the network                            |
| OPS_ETHERSCAN_NETWORK_NAME | (Optional) Etherscan network name (e.g., mainnet)   |
| OPS_API_URL                | (Optional) Custom API URL for the network           |
| OPS_BROWSER_URL            | (Optional) Custom browser URL for the network       |
| OPS_HARDFORK               | (Optional) Hardfork to use (e.g., london)           |
| OPS_L1_NETWORK             | (Optional) L1 network name                          |
| OPS_VERSION                | Project version                                     |
| NODE_RPC                   | (Optional) RPC URL for forking Hardhat node         |

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
OPS_VERSION=6.7.0
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
OPS_VERSION=6.7.0
```

## MAKEFILE TARGETS

Here is a list of Makefile targets you can use by running `make <target-name>` in the terminal:
- install - install project dependencies and utils.
- install-utils - Installs required system utilities (yarn, wget) using Homebrew.
- install-dependencies - Installs project dependencies using yarn.
- run - Runs the setup for the specified network, updating network and version info.
- show-chain-config - Downloads and displays chain ID information for the specified network.
- update-networks - Adds the specified network configuration to the networks file if not present.
- update-ver - Updates the version field in package.json to the specified version.
- show-env - Displays the required environment variables for the selected network.
- update-env - Appends required environment variable keys to the .env file if missing.
- launch-hh-node - Launches a Hardhat node, optionally forking from a specified RPC.
- git-latest-tag - Shows the latest git tag in the repository.
- git-checkout - Creates and checks out a new git branch for the specified network.
- git-push - Commits and pushes changes to the remote feature branch for the network.
- env-example - Generates an example .env file with all required variables.
- help - Prints a summary of available make targets and their descriptions.

## TODO 

- logging
- error handling