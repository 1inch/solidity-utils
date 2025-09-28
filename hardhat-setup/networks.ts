import dotenv from 'dotenv';
import { ChainConfig } from '@nomicfoundation/hardhat-verify/src/types';
import { HardhatNetworkAccountsUserConfig, Network, NetworksUserConfig } from 'hardhat/types';

/**
 * @category Hardhat-Setup
 * Loads environment variables into process.env using the dotenv package.
 * By default, loads variables from a `.env` file in the project root.
 * You can provide custom options (e.g. a different path or encoding) via the `options` parameter.
 * @param options Optional configuration object for dotenv (e.g. `{ path: '.env.local' }`).
 * @see https://github.com/motdotla/dotenv#config
 */
export function loadEnv(options?: dotenv.DotenvConfigOptions): void {
    dotenv.config(options);
}

/**
 * @category Hardhat-Setup
 * Configuration type for managing Etherscan integration in Hardhat setups.
 * @param apiKey The API key for accessing the Etherscan API v2 (used for all networks).
 * @param customChains Array of custom blockchain network configurations.
 */
export type Etherscan = {
    apiKey: string,
    customChains: ChainConfig[],
};

/**
 * @category Hardhat-Setup
 * A helper method to get the network name from the command line arguments.
 * @returns The network name.
 */
export function getNetwork(): string {
    const index = process.argv.findIndex((arg) => arg === '--network') + 1;
    return index !== 0 ? process.argv[index] : 'unknown';
}

/**
 * @category Hardhat-Setup
 * A helper method to parse RPC configuration strings. Checks that the string is in the expected format.
 * @param envRpc The RPC configuration string to parse.
 * @returns An object containing the RPC URL and optional auth key HTTP header.
 */
export function parseRpcEnv(envRpc: string): { url: string, authKeyHttpHeader?: string } {
    const [ url, authKeyHttpHeader, overflow ] = envRpc.split('|');
    if (overflow || url === '') {
        throw new Error(`Invalid RPC PARAM: ${envRpc}. It should be in the format: <RPC_URL> or <RPC_URL>|<AUTH_KEY_HTTP_HEADER>`);
    }
    return { url, authKeyHttpHeader };
}

/**
 * @category Hardhat-Setup
 * A helper method to reset the Hardhat network to the local network or to a fork.
 * @param network The Hardhat network object.
 * @param networkName The name of the network to reset to.
 */
export async function resetHardhatNetworkFork(network: Network, networkName: string) {
    if (networkName.toLowerCase() === 'hardhat') {
        await network.provider.request({ // reset to local network
            method: 'hardhat_reset',
            params: [],
        });
    } else {
        const { url, authKeyHttpHeader } = parseRpcEnv(process.env[`${networkName.toUpperCase()}_RPC_URL`] || '');
        await network.provider.request({ // reset to networkName fork
            method: 'hardhat_reset',
            params: [{
                forking: {
                    jsonRpcUrl: url,
                    httpHeaders: authKeyHttpHeader ? { 'auth-key': authKeyHttpHeader } : undefined,
                },
            }],
        });
    }
}

/**
 * @category Hardhat-Setup
 * The Network class is a helper class to register networks and Etherscan API keys.
 * See the [README](https://github.com/1inch/solidity-utils/tree/master/hardhat-setup/README.md) for usage.
 */
export class Networks {
    networks: NetworksUserConfig = {};
    etherscan: Etherscan = { apiKey: '', customChains: [] };

    constructor(
        useHardhat: boolean = true,
        forkingNetworkName?: string,
        saveHardhatDeployments: boolean = false,
        forkingAccounts?: HardhatNetworkAccountsUserConfig,
        autoLoadEnv: boolean = true
    ) {
        if (autoLoadEnv) {
            loadEnv();
        }

        if (useHardhat || forkingNetworkName) {
            this.networks.hardhat = {
                chainId: Number(process.env.FORK_CHAIN_ID) || 31337,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                saveDeployments: saveHardhatDeployments,
            };
            if (forkingAccounts) {
                this.networks.hardhat!.accounts = forkingAccounts;
            }
        }

        if (forkingNetworkName) {
            const forkRpcKey = `${forkingNetworkName.toUpperCase()}_RPC_URL`;
            const forkRpcEnv = process.env[forkRpcKey];
            if (!forkRpcEnv) {
                throw new Error(`Missing required environment variable '${forkRpcKey}'. Did you forget to call loadEnv() or set autoLoadEnv to true?`);
            }
            const { url, authKeyHttpHeader } = parseRpcEnv(forkRpcEnv || '');
            this.networks.hardhat!.forking = {
                url,
                httpHeaders: authKeyHttpHeader ? { 'auth-key': authKeyHttpHeader } : undefined,
            };
        }
    }

    register(name: string, chainId: number, rpc?: string, privateKey?: string, etherscanNetworkName?: string, etherscanKey?: string, hardfork: string = 'shanghai', l1Network?: string) {
        if (rpc && privateKey && etherscanNetworkName && etherscanKey) {
            const { url, authKeyHttpHeader } = parseRpcEnv(rpc);
            this.networks[name] = {
                url,
                httpHeaders: authKeyHttpHeader ? { 'auth-key': authKeyHttpHeader } : undefined,
                chainId,
                accounts: [privateKey],
                hardfork,
                ...(l1Network && { ethNetwork: l1Network, zksync: true }),
            };
            if (etherscanKey) {
                this.etherscan.apiKey = etherscanKey;
            }
            console.log(`Network '${name}' registered`);
        } else {
            console.log(`Network '${name}' not registered`);
        }
    }

    registerCustom(name: string, chainId: number, url?: string, privateKey?: string, etherscanKey?: string, apiURL: string = '', browserURL: string = '', hardfork = 'paris') {
        if (url && privateKey && etherscanKey) {
            this.register(name, chainId, url, privateKey, name, etherscanKey, hardfork);
            this.etherscan.customChains.push({ network: name, chainId, urls: { apiURL, browserURL } });
        }
    }

    registerAll(): { networks: NetworksUserConfig, etherscan: Etherscan } {
        const privateKey = process.env.PRIVATE_KEY;
        const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
        /* eslint-disable max-len */
        this.register('mainnet', 1, process.env.MAINNET_RPC_URL, process.env.MAINNET_PRIVATE_KEY || privateKey, 'mainnet', etherscanApiKey);
        this.register('bsc', 56, process.env.BSC_RPC_URL, process.env.BSC_PRIVATE_KEY || privateKey, 'bsc', etherscanApiKey);
        this.register('sepolia', 11155111, process.env.SEPOLIA_RPC_URL, process.env.SEPOLIA_PRIVATE_KEY || privateKey, 'sepolia', etherscanApiKey);
        this.register('optimistic', 10, process.env.OPTIMISTIC_RPC_URL, process.env.OPTIMISTIC_PRIVATE_KEY || privateKey, 'optimisticEthereum', etherscanApiKey);
        this.register('matic', 137, process.env.MATIC_RPC_URL, process.env.MATIC_PRIVATE_KEY || privateKey, 'polygon', etherscanApiKey);
        this.register('arbitrum', 42161, process.env.ARBITRUM_RPC_URL, process.env.ARBITRUM_PRIVATE_KEY || privateKey, 'arbitrumOne', etherscanApiKey);
        this.register('xdai', 100, process.env.XDAI_RPC_URL, process.env.XDAI_PRIVATE_KEY || privateKey, 'xdai', etherscanApiKey);
        this.register('avax', 43114, process.env.AVAX_RPC_URL, process.env.AVAX_PRIVATE_KEY || privateKey, 'avalanche', etherscanApiKey, 'paris');
        this.register('base', 8453, process.env.BASE_RPC_URL, process.env.BASE_PRIVATE_KEY || privateKey, 'base', etherscanApiKey);
        this.register('baseSepolia', 84532, process.env.BASESEPOLIA_RPC_URL, process.env.BASESEPOLIA_PRIVATE_KEY || privateKey, 'baseSepolia', etherscanApiKey);
        this.registerCustom('linea', 59144, process.env.LINEA_RPC_URL, process.env.LINEA_PRIVATE_KEY || privateKey, etherscanApiKey, 'https://api.lineascan.build/api', 'https://lineascan.build/', 'london');
        this.registerCustom('sonic', 146, process.env.SONIC_RPC_URL, process.env.SONIC_PRIVATE_KEY || privateKey, etherscanApiKey, 'https://api.sonicscan.org/api', 'https://sonicscan.org/', 'shanghai');
        this.registerCustom('unichain', 130, process.env.UNICHAIN_RPC_URL, process.env.UNICHAIN_PRIVATE_KEY || privateKey, etherscanApiKey, 'https://api.uniscan.xyz/api', 'https://uniscan.xyz/', 'shanghai');
        this.register('zksync', 324, process.env.ZKSYNC_RPC_URL, process.env.ZKSYNC_PRIVATE_KEY || privateKey, 'zksyncmainnet', etherscanApiKey, 'paris', 'mainnet');
        this.register('zksyncTest', 300, process.env.ZKSYNC_TEST_RPC_URL, process.env.ZKSYNC_TEST_PRIVATE_KEY || privateKey, 'zksyncsepolia', etherscanApiKey, 'paris', 'sepolia');
        // For 'zksyncFork' network you should use zksync fork node: https://github.com/matter-labs/era-test-node
        this.register('zksyncFork', 260, process.env.ZKSYNC_FORK_RPC_URL, process.env.ZKSYNC_FORK_PRIVATE_KEY || privateKey, 'zksyncfork', 'none', 'paris', process.env.ZKSYNC_LOCAL_ETH_NETWORK || 'mainnet');
        this.register('zksyncLocal', 270, process.env.ZKSYNC_LOCAL_RPC_URL, process.env.ZKSYNC_PRIVATE_KEY || privateKey, 'zksynclocal', 'none', 'paris', process.env.ZKSYNC_LOCAL_ETH_NETWORK);
        
        // [[AUTOMATION]]
        
        /* eslint-enable max-len */
        return { networks: this.networks, etherscan: this.etherscan };
    }
}
