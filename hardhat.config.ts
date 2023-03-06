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

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.15',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000000,
                details: {
                    yulDetails: {
                        optimizerSteps:
                        /* eslint-disable */
                        'dhfoDgvulfnTUtnIf' +          // None of these can make stack problems worse
                        '[' +
                            'xa[r]EscLM' +             // Turn into SSA and simplify
                            'cCTUtTOntnfDIul' +        // Perform structural simplification
                            'Lcul' +                   // Simplify again
                            'Vcul [j]' +               // Reverse SSA

                        // should have good 'compilability' property here.

                            'Tpeul' +                  // Run functional expression inliner
                            'xa[rul]' +                // Prune a bit more in SSA
                            'xa[r]cL' +                // Turn into SSA again and simplify
                            // 'gvif' +                   // Run full inliner
                            'CTUca[r]LSsTFOtfDnca[r]Iulc' + // SSA plus simplify
                        ']' +
                        'jmul[jul] VcTOcul jmul',     // Make source short and pretty
                        /* eslint-enable */
                    },
                },
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
