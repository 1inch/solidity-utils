import '@typechain/hardhat';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import 'hardhat-gas-reporter';
import 'hardhat-deploy';
import '@nomicfoundation/hardhat-verify';
import 'solidity-docgen';
require('solidity-coverage'); // require because no TS typings available
import dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import { HardhatNetworkUserConfig } from 'hardhat/types';
import { Networks, getNetwork } from './hardhat-setup';

dotenv.config();

declare module 'hardhat/types/runtime' {
    interface HardhatRuntimeEnvironment {
        __SOLIDITY_COVERAGE_RUNNING?: boolean | undefined;
    }
}

const { networks, etherscan } = new Networks();

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.25',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000000,
            },
            evmVersion: (networks[getNetwork()] as HardhatNetworkUserConfig)?.hardfork || 'cancun',
            viaIR: true,
        },
    },
    etherscan,
    networks,
    gasReporter: {
        enabled: true,
    },
    typechain: {
        target: 'ethers-v6',
    },
    docgen: {
        outputDir: 'docs/contracts',
        templates: 'docgen/templates',
        pages: 'files',
        exclude: ['tests'],
    },
};

export default config;
