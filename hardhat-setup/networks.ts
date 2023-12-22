import dotenv from 'dotenv';
import { ChainConfig } from '@nomicfoundation/hardhat-verify/src/types';
import { NetworkUserConfig, NetworksUserConfig } from 'hardhat/types';

export type Etherscan = { apiKey: {[key: string]: string}, customChains: ChainConfig[] };

export function getNetwork(): string {
    const index = process.argv.findIndex((arg) => arg === '--network') + 1;
    return index !== 0 ? process.argv[index] : 'unknown';
}

export class Networks {
    networks: NetworksUserConfig = {};
    etherscan: Etherscan = { apiKey: {}, customChains: [] };

    constructor(useHardhat: boolean = true, forkingNetworkName?: string, needAuthKeyHttpHeader: boolean = false, saveHardhatDeployments: boolean = false) {
        dotenv.config();
        this.updateHardhatNetwork(useHardhat, forkingNetworkName, needAuthKeyHttpHeader, saveHardhatDeployments);
    }

    updateHardhatNetwork(useHardhat: boolean, forkingNetworkName?: string, needAuthKeyHttpHeader: boolean = false, saveHardhatDeployments: boolean = false) {
        if (useHardhat || forkingNetworkName) {
            this.networks.hardhat = {
                chainId: Number(process.env.FORK_CHAIN_ID) || 31337,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                saveDeployments: saveHardhatDeployments,
            };
        }

        if (forkingNetworkName) {
            this.networks.hardhat!.forking = {
                url: process.env[`${forkingNetworkName.toUpperCase()}_RPC_URL`] || '',
                httpHeaders: needAuthKeyHttpHeader
                    ? { 'auth-key': process.env.RPC_AUTH_HEADER || '' }
                    : undefined,
            };
        }
    }

    register(name: string, chainId: number, url?: string, privateKey?: string, etherscanNetworkName?: string, etherscanKey?: string, hardfork: string = 'paris') {
        if (url && privateKey && etherscanNetworkName && etherscanKey) {
            this.networks[name] = {
                url,
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

    registerZksync() {
        if (process.env.ZKSYNC_PRIVATE_KEY) {
            this.networks.zksync = {
                url: process.env.ZKSYNC_RPC_URL || 'https://mainnet.era.zksync.io',
                ethNetwork: 'mainnet',
                zksync: true,
                chainId: 324,
                verifyURL: 'https://zksync2-mainnet-explorer.zksync.io/contract_verification',
                accounts: [process.env.ZKSYNC_PRIVATE_KEY],
                hardfork: 'paris',
            } as NetworkUserConfig;
            this.networks.zksyncFork = {
                url: process.env.ZKSYNC_RPC_URL || '', // you should use zksync fork node: https://github.com/matter-labs/era-test-node
                ethNetwork: 'mainnet',
                zksync: true,
                chainId: 260,
                hardfork: 'paris',
            } as NetworkUserConfig;
            this.networks.zksyncLocal = {
                url: process.env.ZKSYNC_RPC_URL || 'http://localhost:3050',
                ethNetwork: process.env.ZKSYNC_ETH_NETWORK || 'http://localhost:8545',
                zksync: true,
                chainId: 270,
                hardfork: 'paris',
            } as NetworkUserConfig;
            this.networks.zksyncTest = {
                url: process.env.ZKSYNC_RPC_URL || 'https://testnet.era.zksync.dev',
                ethNetwork: 'goerli',
                zksync: true,
                chainId: 280,
                hardfork: 'paris',
            } as NetworkUserConfig;
            console.log('Network \'zksync\' registered');
        } else {
            console.log('Network \'zksync\' not registered');
        }
    }

    registerAll(): { networks: NetworksUserConfig, etherscan: Etherscan } {
        this.register('mainnet', 1, process.env.MAINNET_RPC_URL, process.env.MAINNET_PRIVATE_KEY, 'mainnet', process.env.MAINNET_ETHERSCAN_KEY, 'shanghai');
        this.register('bsc', 56, process.env.BSC_RPC_URL, process.env.BSC_PRIVATE_KEY, 'bsc', process.env.BSC_ETHERSCAN_KEY);
        this.register('kovan', 42, process.env.KOVAN_RPC_URL, process.env.KOVAN_PRIVATE_KEY, 'kovan', process.env.KOVAN_ETHERSCAN_KEY);
        this.register('optimistic', 10, process.env.OPTIMISTIC_RPC_URL, process.env.OPTIMISTIC_PRIVATE_KEY, 'optimisticEthereum', process.env.OPTIMISTIC_ETHERSCAN_KEY);
        this.register('matic', 137, process.env.MATIC_RPC_URL, process.env.MATIC_PRIVATE_KEY, 'polygon', process.env.MATIC_ETHERSCAN_KEY);
        this.register('arbitrum', 42161, process.env.ARBITRUM_RPC_URL, process.env.ARBITRUM_PRIVATE_KEY, 'arbitrumOne', process.env.ARBITRUM_ETHERSCAN_KEY);
        this.register('xdai', 100, process.env.XDAI_RPC_URL, process.env.XDAI_PRIVATE_KEY, 'gnosis', process.env.XDAI_ETHERSCAN_KEY);
        this.register('avax', 43114, process.env.AVAX_RPC_URL, process.env.AVAX_PRIVATE_KEY, 'avalanche', process.env.AVAX_ETHERSCAN_KEY);
        this.register('fantom', 250, process.env.FANTOM_RPC_URL, process.env.FANTOM_PRIVATE_KEY, 'opera', process.env.FANTOM_ETHERSCAN_KEY);
        this.register('aurora', 1313161554, process.env.AURORA_RPC_URL, process.env.AURORA_PRIVATE_KEY, 'aurora', process.env.AURORA_ETHERSCAN_KEY);
        this.register('base', 8453, process.env.BASE_RPC_URL, process.env.BASE_PRIVATE_KEY, 'base', process.env.BASE_ETHERSCAN_KEY);
        this.registerCustom('klaytn', 8217, process.env.KLAYTN_RPC_URL, process.env.KLAYTN_PRIVATE_KEY, process.env.KLAYTN_ETHERSCAN_KEY, 'https://scope.klaytn.com/', 'https://scope.klaytn.com/');
        this.registerZksync();
        return { networks: this.networks, etherscan: this.etherscan };
    }

    unregister(name: string) {
        delete this.networks[name];
    }

    unregisterBatch(names: string[]) {
        names.forEach((name) => this.unregister(name));
    }
}
