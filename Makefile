# Conditionally include .env or .env.automation based on OPS_LAUNCH_MODE
ifeq ($(OPS_LAUNCH_MODE),auto)
-include .env.automation
else
-include .env
endif
export

OPS_NETWORK:=$(subst ",,$(OPS_NETWORK))
OPS_CHAIN_ID:=$(subst ",,$(OPS_CHAIN_ID))
OPS_REG_TYPE:=$(subst ",,$(OPS_REG_TYPE))
OPS_ETHERSCAN_NETWORK_NAME:=$(subst ",,$(OPS_ETHERSCAN_NETWORK_NAME))
OPS_API_URL:=$(subst ",,$(OPS_API_URL))
OPS_BROWSER_URL:=$(subst ",,$(OPS_BROWSER_URL))
OPS_HARDFORK:=$(subst ",,$(OPS_HARDFORK))
OPS_L1_NETWORK:=$(subst ",,$(OPS_L1_NETWORK))

CURRENT_DIR=$(shell pwd)
ENV_FILE=$(CURRENT_DIR)/.env
NETWORKS_FILE=$(CURRENT_DIR)/hardhat-setup/networks.ts
PACKAGE_FILE=$(CURRENT_DIR)/package.json
PREFIX=$(shell echo "$(OPS_NETWORK)" | sed -r 's/([a-z0-9])([A-Z])/\1_\2/g' | tr '[:lower:]' '[:upper:]')
REGOP_PREFIX=        this.register

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
REGOP_ENV_ETHERSCAN_KEY=etherscanApiKey

REGOP=$(REGOP_PREFIX)$(REGOP_TYPE)(\"$(OPS_NETWORK)\", $(OPS_CHAIN_ID), $(REGOP_ENV_PREFIX)$(REGOP_ENV_RPC_URL), $(REGOP_ENV_PREFIX)$(REGOP_ENV_PK) || privateKey$(REGOP_ETHERSCAN_NETWORK_NAME), $(REGOP_ENV_PREFIX)$(REGOP_ENV_ETHERSCAN_KEY)$(REGOP_API_URL)$(REGOP_BROWSER_URL)$(REGOP_HARDFORK)$(REGOP_L1_NETWORK));

install: install-utils install-dependencies

install-utils:
			brew install yarn wget

install-dependencies:
			yarn

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
		echo "Running setup for network: $(OPS_NETWORK) with chain ID: $(OPS_CHAIN_ID):"; \
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
			echo "The next network configuration will be added to $(NETWORKS_FILE): $(REGOP)"; \
			tmpfile=$$(mktemp); \
			awk '1;/\[\[AUTOMATION\]\]/{print "$(REGOP)"}' $(NETWORKS_FILE) > $$tmpfile; \
			sed -i '' 's/"/'\''/g' $$tmpfile; \
			mv $$tmpfile $(NETWORKS_FILE); \
		fi; \
		}

update-ver:
		@npm version minor --force

help:
	@echo "Available targets:"
	@echo "  install              Install utilities and dependencies"
	@echo "  install-utils        Install required utilities (yarn, wget)"
	@echo "  install-dependencies Install project dependencies with yarn"
	@echo "  run                  Run setup for the specified network"
	@echo "  show-chain-config    Show chain ID for the specified network"
	@echo "  update-networks      Add network configuration to networks.ts"
	@echo "  update-ver           Update version in package.json"
	@echo "  help                 Show this help message"

.PHONY: install install-utils install-dependencies run show-chain-config update-networks update-ver help