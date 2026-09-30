[**@1inch/solidity-utils**](../../README.md)

***

[@1inch/solidity-utils](../../README.md) / [hardhat-setup](../README.md) / Etherscan

# Type Alias: Etherscan

> **Etherscan** = `object`

Defined in: [hardhat-setup/networks.ts:32](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/hardhat-setup/networks.ts#L32)

## Param

**apiKey**

API key used for every network, or API keys indexed by network name.

## Param

**customChains**

Custom explorer entries containing the network name, chain ID, API URL, and browser URL.

## Properties

### apiKey

> **apiKey**: `string` \| \{\[`network`: `string`\]: `string`; \}

Defined in: [hardhat-setup/networks.ts:33](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/hardhat-setup/networks.ts#L33)

***

### customChains

> **customChains**: `object`[]

Defined in: [hardhat-setup/networks.ts:34](https://github.com/1inch/solidity-utils/blob/59968ee28ebe64663c124f86940195eaff18d672/hardhat-setup/networks.ts#L34)

#### chainId

> **chainId**: `number`

#### network

> **network**: `string`

#### urls

> **urls**: `object`

##### urls.apiURL

> **apiURL**: `string`

##### urls.browserURL

> **browserURL**: `string`
