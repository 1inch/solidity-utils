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
        version: '0.8.23',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000000,
            },
            evmVersion: 'shanghai',
            viaIR: true,
        },
    },
    etherscan,
    networks,
    gasReporter: {
        enabled: true,
    },
    tracer: {
        enableAllOpcodes: true,
    },
    typechain: {
        target: 'ethers-v6',
    },
};

export default config;
