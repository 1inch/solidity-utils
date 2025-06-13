-include .env

CURRENT_DIR=$(shell pwd)
ENV_FILE=$(CURRENT_DIR)/.env
NETWORKS_FILE=$(CURRENT_DIR)/hardhat-setup/networks.ts
PACKAGE_FILE=$(CURRENT_DIR)/package.json
PREFIX=$(shell echo "$(OPS_NETWORK)" | sed -r 's/([a-z0-9])([A-Z])/\1_\2/g' | tr '[:lower:]' '[:upper:]')
REGOP_PREFIX=\t\tthis.register

ifeq ($(OPS_REG_TYPE),custom)
	REGOP_TYPE=Custom

	ifneq ($(OPS_API_URL),)
		REGOP_API_URL=, \"$(OPS_API_URL)\"
	endif

	ifneq ($(OPS_BROWSER_URL),)
		REGOP_BROWSER_URL=, \"$(OPS_BROWSER_URL)\"
	endif
else 
	ifneq ($(OPS_ETHERSCAN_NETWORK_NAME),)
		REGOP_ETHERSCAN_NETWORK_NAME=, \"$(OPS_ETHERSCAN_NETWORK_NAME)\"
	endif

	ifneq ($(OPS_L1_NETWORK),)
		REGOP_L1_NETWORK=, \"$(OPS_L1_NETWORK)\"
	endif
endif

ifneq ($(OPS_HARDFORK),)
	REGOP_HARDFORK=, \"$(OPS_HARDFORK)\"
endif

REGOP_ENV_PREFIX=process.env.
REGOP_ENV_RPC_URL=$(PREFIX)_RPC_URL
REGOP_ENV_PK=$(PREFIX)_PRIVATE_KEY
REGOP_ENV_ETHERSCAN_KEY=$(PREFIX)_ETHERSCAN_KEY

REGOP=$(REGOP_PREFIX)$(REGOP_TYPE)(\"$(OPS_NETWORK)\", $(OPS_CHAIN_ID), $(REGOP_ENV_PREFIX)$(REGOP_ENV_RPC_URL), $(REGOP_ENV_PREFIX)$(REGOP_ENV_PK) || privateKey$(REGOP_ETHERSCAN_NETWORK_NAME), $(REGOP_ENV_PREFIX)$(REGOP_ENV_ETHERSCAN_KEY)$(REGOP_API_URL)$(REGOP_BROWSER_URL)$(REGOP_HARDFORK)$(REGOP_L1_NETWORK));

install: install-utils install-dependencies

install-utils:
			brew install yarn wget

install-dependencies:
			yarn install

run:
		@{ \
		if [ -z "$(OPS_NETWORK)" ]; then \
			echo "Please set OPS_NETWORK environment variable!"; \
			exit 1; \
		fi; \
		if [ -z "$(OPS_CHAIN_ID)" ]; then \
			echo "Please set OPS_CHAIN_ID environment variable!"; \
			exit 1; \
		fi; \
		if [ -z "$(OPS_VERSION)" ]; then \
			echo "Please set OPS_VERSION environment variable!"; \
			exit 1; \
		fi; \
		echo "Running setup for network: $(OPS_NETWORK) with chain ID: $(OPS_CHAIN_ID) and version: $(OPS_VERSION)"; \
		make update-networks; \
		make update-ver; \
		echo "Setup completed successfully!"; \
		}

URL_CHAIN_CONFIG=https://raw.githubusercontent.com/NomicFoundation/hardhat/refs/heads/main/packages/hardhat-verify/src/internal/chain-config.ts
URL_CHAIN_LIST=https://chainlist.org/rpcs.json

show-chain-config:
		@wget -q -O chain-config.ts $(URL_CHAIN_CONFIG)
		@echo "Getting chain ID for network: $(OPS_NETWORK) from $(URL_CHAIN_CONFIG)"
		@if grep -q "network: \"$(OPS_NETWORK)\"" chain-config.ts; then \
			echo "Use OPS_CHAIN_ID=$$(grep -A 1 "network: \"$(OPS_NETWORK)\"" chain-config.ts | sed -nE 's/    chainId: ([0-9]*),/\1/p') in your .env file"; \
		else \
			echo "Network $(OPS_NETWORK) not found in chain-config.ts"; \
		fi
		@rm -f chain-config.ts
		@wget -q -O rpcs.json $(URL_CHAIN_LIST)
		@echo "Getting chain ID for network: $(OPS_NETWORK) from $(URL_CHAIN_LIST)"
		@if grep -q "\"shortName\": \"$(OPS_NETWORK)\"" rpcs.json; then \
			echo "Use OPS_CHAIN_ID=$$(grep -A 1 "\"shortName\": \"$(OPS_NETWORK)\"" rpcs.json | sed -nE 's/.*"chainId": ([0-9]*),/\1/p') in your .env file"; \
		else \
			echo "Network $(OPS_NETWORK) not found in rpcs.json"; \
		fi
		@rm -f rpcs.json

update-networks:
		@{ \
		if [ -z "$(OPS_NETWORK)" ]; then \
			echo "Please set OPS_NETWORK environment variable!"; \
			exit 1; \
		fi; \
		if [ -z "$(OPS_CHAIN_ID)" ]; then \
			echo "Please set OPS_CHAIN_ID environment variable!"; \
			exit 1; \
		fi; \
		if grep -q "this.register('$(OPS_NETWORK)'" $(NETWORKS_FILE) || grep -q "this.registerCustom('$(OPS_NETWORK)'" $(NETWORKS_FILE); then \
			echo "Network already exists!"; \
		else \
			echo "Adding network $(OPS_NETWORK) with chain ID $(OPS_CHAIN_ID) to $(NETWORKS_FILE)"; \
			echo "The next network configuration will be added to $(NETWORK_FILE): $(REGOP)"; \
			awk '1;/\[\[AUTOMATION\]\]/{print "$(REGOP)"}' $(NETWORKS_FILE) > $(NETWORKS_FILE).tmp; \
			sed -i '' 's/"/'\''/g' $(NETWORKS_FILE).tmp && mv $(NETWORKS_FILE).tmp $(NETWORKS_FILE); \
		fi; \
		}

update-ver:
		@sed -i '' 's/"version": .*"/"version": '\"$(OPS_VERSION)\"'/g' $(PACKAGE_FILE)

show-env:
		@echo "Environment variables to set:"
		@echo "$(REGOP_ENV_RPC_URL)"
		@echo "$(REGOP_ENV_PK)"
		@echo "$(REGOP_ENV_ETHERSCAN_KEY)"
		@echo "Add these to your .env file."
		@echo "Example:"
		@echo "$(REGOP_ENV_RPC_URL)=<your_rpc_url>"
		@echo "$(REGOP_ENV_PK)=<your_private_key>"
		@echo "$(REGOP_ENV_ETHERSCAN_KEY)=<your_etherscan_key>"
		@echo "Make sure to keep your private key secure and not share it publicly."

update-env:
		@{ \
		for secret in $(REGOP_ENV_RPC_URL) $(REGOP_ENV_PK) $(REGOP_ENV_ETHERSCAN_KEY); do \
			if grep -q "$$secret" $(ENV_FILE); then \
				echo "$$secret secret already exists!"; \
			else \
				echo "\n$$secret=" >> $(ENV_FILE); \
			fi \
		done \
		}

clean:
		rm -f $(CHAIN_ID_FILE)

launch-hh-node:
		@{ \
		if [ -z "$(NODE_RPC)" ]; then \
			echo "NODE_RPC is not set!"; \
			exit 1; \
		fi; \
		echo "Launching Hardhat node with RPC: $(NODE_RPC)"; \
		npx hardhat node --fork $(NODE_RPC) --vvvv --full-trace; \
		}

git-latest-tag:
		@git describe --abbrev=0

git-checkout:
		@git checkout -b feature/$(OPS_NETWORK)

git-push:
		@git add .
		@git commit -m "added $(OPS_NETWORK) network"
		@git push origin feature/$(OPS_NETWORK)

env-example:
	@{ \
	echo 'OPS_REG_TYPE=' >> .env.example; \
	echo 'OPS_NETWORK=mainnet' >> .env.example; \
	echo 'OPS_CHAIN_ID=1' >> .env.example; \
	echo 'OPS_ETHERSCAN_NETWORK_NAME=mainnet' >> .env.example; \
	echo 'OPS_API_URL=' >> .env.example; \
	echo 'OPS_BROWSER_URL=' >> .env.example; \
	echo 'OPS_HARDFORK=' >> .env.example; \
	echo 'OPS_L1_NETWORK=' >> .env.example; \
	echo 'OPS_VERSION=6.6.0' >> .env.example; \
	}

help:
		@echo "Available commands:"
		@echo "  make install                - Install dependencies and utilities"
		@echo "  make run                    - Run the setup for the specified network"
		@echo "  make show-chain-config-info - Show chain config info for the specified network"
		@echo "  make update-networks        - Update networks file with the specified network"
		@echo "  make update-ver             - Update package version"
		@echo "  make show-env               - Show environment variables to set"
		@echo "  make update-env             - Update .env file with required environment variables"
		@echo "  make launch-hh-node         - Launch Hardhat node with specified RPC"
		@echo "  make git-latest-tag         - Get the latest git tag"
		@echo "  make git-checkout           - Checkout a new branch for the feature"
		@echo "  make git-push               - Push changes to the remote repository"
		@echo "  make env-example            - Create an example .env file"
		@echo "  make help                   - Show this help message"

.PHONY: install install-utils install-dependencies run show-chain-config update-networks update-ver show-env update-env launch-hh-node git-latest-tag git-checkout git-push env-example help
