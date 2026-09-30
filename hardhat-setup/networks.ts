import dotenv from 'dotenv';
import type {
    EdrNetworkAccountsUserConfig,
    NetworkUserConfig,
} from 'hardhat/types/config';
import type { EthereumProvider } from 'hardhat/types/providers';

/**
 * Account configuration for a Hardhat EDR simulated network.
 * @category Hardhat-Setup
 * @deprecated Use `EdrNetworkAccountsUserConfig`. This alias is retained for consumer compatibility.
 */
export type HardhatNetworkAccountsUserConfig = EdrNetworkAccountsUserConfig;

/**
 * @category Hardhat-Setup
 * Loads environment variables into process.env using the dotenv package.
 * By default, variables are loaded from a `.env` file in the project root.
 * @param options Optional dotenv configuration, such as a custom path or encoding.
 * @see https://github.com/motdotla/dotenv#config
 */
export function loadEnv(options?: dotenv.DotenvConfigOptions): void {
    dotenv.config(options);
}

/**
 * @category Hardhat-Setup
 * Configuration type for managing Etherscan integration in Hardhat setups.
 * @param apiKey API key used for every network, or API keys indexed by network name.
 * @param customChains Custom explorer entries containing the network name, chain ID, API URL, and browser URL.
 */
export type Etherscan = {
    apiKey: string | { [network: string]: string },
    customChains: Array<{
        network: string,
        chainId: number,
        urls: {
            apiURL: string,
            browserURL: string,
        },
    }>,
};

/**
 * @category Hardhat-Setup
 * A helper method to get the network name from the command line arguments.
 * @returns The value after `--network`, or `"default"` when the option is absent.
 */
export function getNetwork(): string {
    const index = process.argv.findIndex((arg) => arg === '--network') + 1;
    return index !== 0 ? process.argv[index] : 'default';
}

/**
 * @category Hardhat-Setup
 * Parses an RPC configuration in `<RPC_URL>` or `<RPC_URL>|<AUTH_KEY_HTTP_HEADER>` format.
 * @param envRpc RPC configuration string to parse.
 * @returns The RPC URL and, when supplied, the value for the `auth-key` HTTP header.
 * @throws If the URL is empty or the configuration contains more than one separator.
 */
export function parseRpcEnv(envRpc: string): { url: string, authKeyHttpHeader?: string } {
    const [url, authKeyHttpHeader, overflow] = envRpc.split('|');
    if (overflow || url === '') {
        throw new Error(`Invalid RPC PARAM: ${envRpc}. It should be in the format: <RPC_URL> or <RPC_URL>|<AUTH_KEY_HTTP_HEADER>`);
    }
    return { url, authKeyHttpHeader };
}

/**
 * @category Hardhat-Setup
 * Reset a Hardhat/EDR network to local state or to a fork.
 * Local network names (`hardhat`, `default`, and `hardhatMainnet`) are reset
 * without forking. Other names use `<NETWORK_NAME>_RPC_URL`.
 * @param provider Ethereum provider that handles the `hardhat_reset` request.
 * @param networkName Local network or fork target name.
 */
export async function resetHardhatNetworkFork(
    provider: EthereumProvider,
    networkName: string,
): Promise<void> {
    if (['hardhat', 'default', 'hardhatmainnet'].includes(networkName.toLowerCase())) {
        await provider.request({
            method: 'hardhat_reset',
            params: [],
        });
    } else {
        const { url, authKeyHttpHeader } = parseRpcEnv(process.env[`${networkName.toUpperCase()}_RPC_URL`] || '');
        await provider.request({
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
 * Helper class to register networks and Etherscan API keys for Hardhat 3.
 * See the hardhat-setup README for environment variable formats and usage.
 */
export class Networks {
    networks: Record<string, NetworkUserConfig> = {};
    etherscan: Etherscan = { apiKey: '', customChains: [] };

    /**
     * Creates the network configuration accumulator.
     * @param useHardhat Whether to add the default in-process Hardhat network.
     * @param forkingNetworkName Optional network to fork into the Hardhat network.
     * @param _saveHardhatDeployments Reserved compatibility argument from hardhat-deploy v1; currently ignored.
     * @param forkingAccounts Optional accounts for the Hardhat EDR network.
     * @param autoLoadEnv Whether to load `.env` before reading network configuration.
     * @throws If `forkingNetworkName` is set but its RPC environment variable is missing.
     */
    constructor(
        useHardhat: boolean = true,
        forkingNetworkName?: string,
        _saveHardhatDeployments: boolean = false,
        forkingAccounts?: EdrNetworkAccountsUserConfig,
        autoLoadEnv: boolean = true,
    ) {
        void _saveHardhatDeployments; // reserved for hardhat-deploy v2 parity
        if (autoLoadEnv) {
            loadEnv();
        }

        if (useHardhat || forkingNetworkName) {
            this.networks.hardhat = {
                type: 'edr-simulated',
                chainType: 'l1',
                chainId: Number(process.env.FORK_CHAIN_ID) || 31337,
                hardfork: 'cancun',
            };
            if (forkingAccounts) {
                this.networks.hardhat.accounts = forkingAccounts;
            }
        }

        if (forkingNetworkName) {
            const forkRpcKey = `${forkingNetworkName.toUpperCase()}_RPC_URL`;
            const forkRpcEnv = process.env[forkRpcKey];
            if (!forkRpcEnv) {
                throw new Error(`Missing required environment variable '${forkRpcKey}'. Did you forget to call loadEnv() or set autoLoadEnv to true?`);
            }
            const { url, authKeyHttpHeader } = parseRpcEnv(forkRpcEnv);
            const hardhatNet = this.networks.hardhat;
            if (hardhatNet?.type === 'edr-simulated') {
                hardhatNet.forking = {
                    url,
                    httpHeaders: authKeyHttpHeader ? { 'auth-key': authKeyHttpHeader } : undefined,
                };
            }
        }
    }

    /**
     * Registers an HTTP network when all required connection and explorer values are present.
     * @param name Hardhat network name.
     * @param chainId EIP-155 chain ID.
     * @param rpc RPC configuration accepted by `parseRpcEnv`.
     * @param privateKey Private key used by the network account.
     * @param etherscanNetworkName Explorer network identifier. Required for registration.
     * @param etherscanKey Explorer API key.
     * @param hardfork Hardfork metadata retained on the network configuration.
     * @param l1Network Optional L1 network name used by zkSync-compatible configurations.
     */
    register(
        name: string,
        chainId: number,
        rpc?: string,
        privateKey?: string,
        etherscanNetworkName?: string,
        etherscanKey?: string,
        hardfork: string = 'shanghai',
        l1Network?: string,
    ) {
        if (rpc && privateKey && etherscanNetworkName && etherscanKey) {
            const { url, authKeyHttpHeader } = parseRpcEnv(rpc);
            this.networks[name] = {
                type: 'http',
                chainType: 'l1',
                url,
                httpHeaders: authKeyHttpHeader ? { 'auth-key': authKeyHttpHeader } : undefined,
                chainId,
                accounts: [privateKey],
                // hardfork retained for consumers reading network config metadata
                ...(hardfork ? { hardfork } : {}),
                ...(l1Network && { ethNetwork: l1Network, zksync: true }),
            } as NetworkUserConfig;
            if (etherscanKey) {
                this.etherscan.apiKey = etherscanKey;
            }
            console.log(`Network '${name}' registered`);
        } else {
            console.log(`Network '${name}' not registered`);
        }
    }

    /**
     * Registers an HTTP network and its custom block explorer.
     * @param name Hardhat and explorer network name.
     * @param chainId EIP-155 chain ID.
     * @param url RPC URL.
     * @param privateKey Private key used by the network account.
     * @param etherscanKey Explorer API key.
     * @param apiURL Block explorer API endpoint.
     * @param browserURL Public block explorer URL.
     * @param hardfork Hardfork metadata retained on the network configuration.
     */
    registerCustom(
        name: string,
        chainId: number,
        url?: string,
        privateKey?: string,
        etherscanKey?: string,
        apiURL: string = '',
        browserURL: string = '',
        hardfork = 'paris',
    ) {
        if (url && privateKey && etherscanKey) {
            this.register(name, chainId, url, privateKey, name, etherscanKey, hardfork);
            this.etherscan.customChains.push({ network: name, chainId, urls: { apiURL, browserURL } });
        }
    }

    /**
     * Registers all networks supported by this package from environment variables.
     * Networks without complete RPC, key, and explorer configuration are skipped.
     * @returns The accumulated Hardhat network and Etherscan configurations.
     */
    registerAll(): { networks: Record<string, NetworkUserConfig>, etherscan: Etherscan } {
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
        this.registerCustom('zksync', 324, process.env.ZKSYNC_RPC_URL, process.env.ZKSYNC_PRIVATE_KEY || privateKey, etherscanApiKey, 'https://api.zksync.network/api', 'https://era.zksync.network/', 'paris');
        this.register('zksync-zkevm', 324, process.env.ZKSYNC_RPC_URL, process.env.ZKSYNC_PRIVATE_KEY || privateKey, 'zksyncmainnet', etherscanApiKey, 'paris', 'mainnet');
        this.register('zksyncTest', 300, process.env.ZKSYNC_TEST_RPC_URL, process.env.ZKSYNC_TEST_PRIVATE_KEY || privateKey, 'zksyncsepolia', etherscanApiKey, 'paris', 'sepolia');
        this.register('zksyncFork', 260, process.env.ZKSYNC_FORK_RPC_URL, process.env.ZKSYNC_FORK_PRIVATE_KEY || privateKey, 'zksyncfork', 'none', 'paris', process.env.ZKSYNC_LOCAL_ETH_NETWORK || 'mainnet');
        this.register('zksyncLocal', 270, process.env.ZKSYNC_LOCAL_RPC_URL, process.env.ZKSYNC_PRIVATE_KEY || privateKey, 'zksynclocal', 'none', 'paris', process.env.ZKSYNC_LOCAL_ETH_NETWORK);
        this.registerCustom('cronos', 25, process.env.CRONOS_RPC_URL, process.env.CRONOS_PRIVATE_KEY || privateKey, etherscanApiKey, 'https://explorer-api.cronos.org/mainnet/api/v2', 'https://explorer.cronos.com/', 'shanghai');
        this.registerCustom('cronosTest', 338, process.env.CRONOS_TEST_RPC_URL, process.env.CRONOS_TEST_PRIVATE_KEY || privateKey, etherscanApiKey, 'https://explorer-api.cronos.org/testnet/api/v2', 'https://explorer.cronos.org/testnet', 'shanghai');
        this.registerCustom('monad', 143, process.env.MONAD_RPC_URL, process.env.MONAD_PRIVATE_KEY || privateKey, etherscanApiKey, 'https://api.etherscan.io/v2/api?chainid=143', 'https://monadscan.com/', 'shanghai');
        this.registerCustom('arc', 5042, process.env.ARC_RPC_URL, process.env.ARC_PRIVATE_KEY || privateKey, etherscanApiKey, 'https://api.etherscan.io/v2/api?chainid=5042', 'https://explorer.arc.io/api', 'shanghai');
        this.registerCustom('hyperevm', 999, process.env.HYPEREVM_RPC_URL, process.env.HYPEREVM_PRIVATE_KEY || privateKey, etherscanApiKey, 'https://api.etherscan.io/v2/api?chainid=999', 'https://hyperevmscan.com/', 'shanghai');
        this.register('robinhood', 4663, process.env.ROBINHOOD_RPC_URL, process.env.ROBINHOOD_PRIVATE_KEY || privateKey, 'robinhood', etherscanApiKey);
        /* eslint-enable max-len */
        return { networks: this.networks, etherscan: this.etherscan };
    }

    /**
     * Returns the explorer configuration for a network.
     * Cronos networks use the keyed API format required by their Etherscan v1-compatible API.
     * @param network Hardhat network name.
     * @returns Explorer API keys and custom chain configuration.
     */
    getEtherscanConfig(network: string): Etherscan {
        const keys: { [network: string]: string } = {};
        switch (network) {
        case 'cronos':
        case 'cronosTest':
            keys[network] = String(this.etherscan.apiKey);
            return { apiKey: keys, customChains: this.etherscan.customChains };
        default:
            return this.etherscan;
        }
    }

    /**
     * Returns all registered Hardhat network configurations.
     * @returns Network configurations indexed by network name.
     */
    getNetworksConfig() {
        return this.networks;
    }
}
