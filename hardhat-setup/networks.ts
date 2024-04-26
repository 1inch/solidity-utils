import dotenv from 'dotenv';
import { ChainConfig } from '@nomicfoundation/hardhat-verify/src/types';
import { Network, NetworkUserConfig, NetworksUserConfig } from 'hardhat/types';

/**
 * @category Hardhat-Setup
 * @notice Configuration type for managing Etherscan integration in Hardhat setups.
 * @param apiKey Dictionary of API keys for accessing Etherscan, indexed by network name.
 * @param customChains Array of custom blockchain network configurations.
 */
export type Etherscan = {
    apiKey: {[key: string]: string},
    customChains: ChainConfig[],
};

/**
 * @category Hardhat-Setup
 * @notice A helper method to get the network name from the command line arguments.
 * @returns The network name.
 */
export function getNetwork(): string {
    const index = process.argv.findIndex((arg) => arg === '--network') + 1;
    return index !== 0 ? process.argv[index] : 'unknown';
}

/**
 * @category Hardhat-Setup
 * @notice A helper method to parse RPC configuration strings. Checks that the string is in the expected format.
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
 * @notice A helper method to reset the Hardhat network to the local network or to a fork.
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
 * @notice The Network class is a helper class to register networks and Etherscan API keys.
 * See the [README](https://github.com/1inch/solidity-utils/tree/master/hardhat-setup/README.md) for usage.
 */
export class Networks {
    networks: NetworksUserConfig = {};
    etherscan: Etherscan = { apiKey: {}, customChains: [] };

    constructor(useHardhat: boolean = true, forkingNetworkName?: string, saveHardhatDeployments: boolean = false) {
        dotenv.config();

        if (useHardhat || forkingNetworkName) {
            this.networks.hardhat = {
                chainId: Number(process.env.FORK_CHAIN_ID) || 31337,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                saveDeployments: saveHardhatDeployments,
            };
        }

        if (forkingNetworkName) {
            const { url, authKeyHttpHeader } = parseRpcEnv(process.env[`${forkingNetworkName.toUpperCase()}_RPC_URL`] || '');
            this.networks.hardhat!.forking = {
                url,
                httpHeaders: authKeyHttpHeader ? { 'auth-key': authKeyHttpHeader } : undefined,
            };
        }
    }

    register(name: string, chainId: number, rpc?: string, privateKey?: string, etherscanNetworkName?: string, etherscanKey?: string, hardfork: string = 'shanghai') {
        if (rpc && privateKey && etherscanNetworkName && etherscanKey) {
            const { url, authKeyHttpHeader } = parseRpcEnv(rpc);
            this.networks[name] = {
                url,
                httpHeaders: authKeyHttpHeader ? { 'auth-key': authKeyHttpHeader } : undefined,
                chainId,
                accounts: [privateKey],
                hardfork,
            };
            this.etherscan.apiKey[etherscanNetworkName] = etherscanKey;
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

    registerZksync(name: string, chainId: number, rpc?: string, ethNetwork?: string, privateKey?: string, verifyURL?: string, hardfork: string = 'paris') {
        if (privateKey && rpc && ethNetwork) {
            const { url, authKeyHttpHeader } = parseRpcEnv(rpc);
            this.networks[name] = {
                url,
                httpHeaders: authKeyHttpHeader ? { 'auth-key': authKeyHttpHeader } : undefined,
                zksync: true,
                chainId,
                accounts: [privateKey],
                hardfork,
                verifyURL,
                ethNetwork,
            } as NetworkUserConfig;
            console.log(`Network '${name}' registered`);
        } else {
            console.log(`Network '${name}' not registered`);
        }
    }

    registerAll(): { networks: NetworksUserConfig, etherscan: Etherscan } {
        const privateKey = process.env.PRIVATE_KEY;
        this.register('mainnet', 1, process.env.MAINNET_RPC_URL, process.env.MAINNET_PRIVATE_KEY || privateKey, 'mainnet', process.env.MAINNET_ETHERSCAN_KEY);
        this.register('bsc', 56, process.env.BSC_RPC_URL, process.env.BSC_PRIVATE_KEY || privateKey, 'bsc', process.env.BSC_ETHERSCAN_KEY);
        this.register('sepolia', 11155111, process.env.SEPOLIA_RPC_URL, process.env.SEPOLIA_PRIVATE_KEY || privateKey, 'sepolia', process.env.SEPOLIA_ETHERSCAN_KEY);
        this.register('optimistic', 10, process.env.OPTIMISTIC_RPC_URL, process.env.OPTIMISTIC_PRIVATE_KEY || privateKey, 'optimisticEthereum', process.env.OPTIMISTIC_ETHERSCAN_KEY);
        this.register('matic', 137, process.env.MATIC_RPC_URL, process.env.MATIC_PRIVATE_KEY || privateKey, 'polygon', process.env.MATIC_ETHERSCAN_KEY);
        this.register('arbitrum', 42161, process.env.ARBITRUM_RPC_URL, process.env.ARBITRUM_PRIVATE_KEY || privateKey, 'arbitrumOne', process.env.ARBITRUM_ETHERSCAN_KEY);
        this.register('xdai', 100, process.env.XDAI_RPC_URL, process.env.XDAI_PRIVATE_KEY || privateKey, 'xdai', process.env.XDAI_ETHERSCAN_KEY);
        this.register('avax', 43114, process.env.AVAX_RPC_URL, process.env.AVAX_PRIVATE_KEY || privateKey, 'avalanche', process.env.AVAX_ETHERSCAN_KEY, 'paris');
        this.register('fantom', 250, process.env.FANTOM_RPC_URL, process.env.FANTOM_PRIVATE_KEY || privateKey, 'opera', process.env.FANTOM_ETHERSCAN_KEY, 'paris');
        this.register('aurora', 1313161554, process.env.AURORA_RPC_URL, process.env.AURORA_PRIVATE_KEY || privateKey, 'aurora', process.env.AURORA_ETHERSCAN_KEY);
        this.register('base', 8453, process.env.BASE_RPC_URL, process.env.BASE_PRIVATE_KEY || privateKey, 'base', process.env.BASE_ETHERSCAN_KEY);
        this.registerCustom('klaytn', 8217, process.env.KLAYTN_RPC_URL, process.env.KLAYTN_PRIVATE_KEY || privateKey, process.env.KLAYTN_ETHERSCAN_KEY, 'https://scope.klaytn.com/', 'https://scope.klaytn.com/'); // eslint-disable-line max-len
        this.registerZksync('zksync', 324, process.env.ZKSYNC_RPC_URL, 'mainnet', process.env.ZKSYNC_PRIVATE_KEY || privateKey, process.env.ZKSYNC_VERIFY_URL);
        // For 'zksyncFork' network you should use zksync fork node: https://github.com/matter-labs/era-test-node
        this.registerZksync('zksyncFork', 260, process.env.ZKSYNC_FORK_RPC_URL, 'mainnet', process.env.ZKSYNC_FORK_PRIVATE_KEY || privateKey);
        this.registerZksync('zksyncLocal', 270, process.env.ZKSYNC_LOCAL_RPC_URL, process.env.ZKSYNC_LOCAL_ETH_NETWORK, process.env.ZKSYNC_PRIVATE_KEY || privateKey);
        this.registerZksync('zksyncTest', 300, process.env.ZKSYNC_TEST_RPC_URL, 'sepolia', process.env.ZKSYNC_TEST_PRIVATE_KEY || privateKey, process.env.ZKSYNC_TEST_VERIFY_URL);
        return { networks: this.networks, etherscan: this.etherscan };
    }
}
