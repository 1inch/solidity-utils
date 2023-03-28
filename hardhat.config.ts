import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import 'hardhat-gas-reporter';
import 'hardhat-tracer';
require('solidity-coverage'); // require because no TS typings available
import dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import networks from './hardhat.networks';

dotenv.config();

declare module 'hardhat/types/runtime' {
    interface HardhatRuntimeEnvironment {
        __SOLIDITY_COVERAGE_RUNNING?: boolean;
    }
}

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.15',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000000,
            },
            viaIR: true,
        },
    },
    networks,
    gasReporter: {
        enabled: true,
    },
    typechain: {
        target: 'ethers-v5',
    },
};

export default config;
