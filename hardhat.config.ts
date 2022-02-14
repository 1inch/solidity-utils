import '@typechain/hardhat'
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-truffle5';
import 'hardhat-deploy';
import 'hardhat-gas-reporter';
import dotenv from 'dotenv';
import { HardhatUserConfig, } from "hardhat/config";
import networks from './hardhat.networks';

dotenv.config();

const config: HardhatUserConfig = {
    etherscan: {
        apiKey: process.env.ETHERSCAN_KEY,
    },
    solidity: {
        version: '0.8.10',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000000,
            },
        },
    },
    networks,
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    gasReporter: {
        enabled: true,
        currency: 'USD',
    },
    typechain: {
        target: 'truffle-v5'
    },
};

export default config;