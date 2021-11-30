require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-truffle5');
require('dotenv').config();
require('hardhat-deploy');
require('hardhat-gas-reporter');
require('solidity-coverage');

const networks = require('./hardhat.networks');

module.exports = {
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
        enable: true,
        currency: 'USD',
    },
};
