import '@typechain/hardhat';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import 'hardhat-gas-reporter';
import 'hardhat-tracer';
import 'hardhat-deploy';
import '@nomicfoundation/hardhat-verify';
require('solidity-coverage'); // require because no TS typings available
import dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import { HardhatNetworkUserConfig } from 'hardhat/types';
import networks from './hardhat.networks';

dotenv.config();

declare module 'hardhat/types/runtime' {
    interface HardhatRuntimeEnvironment {
        __SOLIDITY_COVERAGE_RUNNING?: boolean | undefined;
    }
}

function getNetwork(): string {
    const index = process.argv.findIndex((arg) => arg === '--network') + 1;
    return index !== 0 ? process.argv[index] : 'unknown';
}

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.22',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000000,
            },
            evmVersion: (networks[getNetwork()] as HardhatNetworkUserConfig)?.hardfork || 'shanghai',
            viaIR: true,
        },
    },
    networks,
    gasReporter: {
        enabled: true,
    },
    typechain: {
        target: 'ethers-v6',
    },
};

export default config;
