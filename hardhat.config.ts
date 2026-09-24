import hardhatToolboxMochaEthers from '@nomicfoundation/hardhat-toolbox-mocha-ethers';
import HardhatDeploy from 'hardhat-deploy';
import { defineConfig } from 'hardhat/config';
import { Networks, getNetwork } from './hardhat-setup/networks.js';

const { networks, etherscan } = new Networks();

const hardhatNetwork = networks.hardhat;
const evmVersion =
    hardhatNetwork?.type === 'edr-simulated'
        ? hardhatNetwork.hardfork || 'cancun'
        : 'cancun';

const etherscanApiKey =
    typeof etherscan.apiKey === 'string'
        ? etherscan.apiKey
        : Object.values(etherscan.apiKey)[0] || '';

export default defineConfig({
    plugins: [hardhatToolboxMochaEthers, HardhatDeploy],
    solidity: {
        version: '0.8.37',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000000,
            },
            evmVersion,
            viaIR: true,
        },
    },
    typechain: {
        outDir: 'typechain-types',
    },
    verify: {
        etherscan: {
            apiKey: etherscanApiKey,
            enabled: Boolean(etherscanApiKey),
        },
    },
    chainDescriptors: Object.fromEntries(
        etherscan.customChains.map((chain) => [
            chain.chainId,
            {
                name: chain.network,
                blockExplorers: {
                    etherscan: {
                        url: chain.urls.browserURL,
                        apiUrl: chain.urls.apiURL,
                    },
                },
            },
        ]),
    ),
    networks,
    paths: {
        tests: {
            mocha: './test',
        },
    },
});

// Keep getNetwork import used (CLI network detection helpers rely on argv parsing).
void getNetwork;
