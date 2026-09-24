import hre, { artifacts, network } from 'hardhat';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import type { Environment } from 'rocketh/types';
import {
    BaseContract,
    BigNumberish,
    BytesLike,
    Contract,
    ContractTransactionReceipt,
    ContractTransactionResponse,
    isBytesLike,
    JsonRpcProvider,
    Signer,
    TransactionReceipt,
    Wallet,
    hexlify,
} from 'ethers';

import { constants } from './prelude.js';
import { ethers, setCode, time } from './hardhatHelpers.js';
import { ICreate3Deployer } from '../typechain-types/index.js';

/**
 * Minimal deployment record compatible with rocketh Environment.save/get.
 */
export type DeploymentRecord = {
    address: string;
    abi: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    bytecode?: string;
    deployedBytecode?: string;
    args?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    transactionHash?: string;
    receipt?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    numDeployments?: number;
};

/**
 * @category utils
 * Options for deployment methods.
 */
export interface DeployContractOptions {
    contractName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructorArgs?: any[];
    /** Rocketh environment used to persist deployment records (hardhat-deploy v2). */
    env?: Environment;
    /** @deprecated Use `env`. Kept for gradual migration from hardhat-deploy v1. */
    deployments?: Environment;
    deployer: string;
    deploymentName?: string;
    skipVerify?: boolean;
    skipIfAlreadyDeployed?: boolean;
    gasPrice?: bigint;
    maxPriorityFeePerGas?: bigint;
    maxFeePerGas?: bigint;
    log?: boolean;
    waitConfirmations?: number;
}

/**
 * @category utils
 * Options for create3 deployment methods.
 */
export interface DeployContractOptionsWithCreate3 extends Omit<DeployContractOptions, 'deployer'> {
    txSigner?: Wallet | HardhatEthersSigner,
    create3Deployer: string,
    salt: string,
}

function resolveEnv(options: { env?: Environment, deployments?: Environment }): Environment | undefined {
    return options.env ?? options.deployments;
}

/**
 * @category utils
 * Deploys a contract with optional Etherscan verification and rocketh save.
 */
export async function deployAndGetContract(options: DeployContractOptions): Promise<Contract> {
    const {
        contractName,
        constructorArgs = [],
        deployer,
        deploymentName = contractName,
        skipVerify = false,
        skipIfAlreadyDeployed = true,
        gasPrice,
        maxPriorityFeePerGas,
        maxFeePerGas,
        log = true,
    } = options;
    const env = resolveEnv(options);
    const networkName = (await network.getOrCreate()).networkName;
    const waitConfirmations = options.waitConfirmations ?? (constants.DEV_CHAINS.includes(networkName) ? 1 : 6);

    if (skipIfAlreadyDeployed && env) {
        const existing = env.getOrNull(deploymentName);
        if (existing != null) {
            if (log) console.log(`Contract ${deploymentName} already deployed at ${existing.address}`);
            return await ethers.getContractAt(contractName, existing.address);
        }
    }

    const factory = await ethers.getContractFactory(contractName);
    const signer = await ethers.getSigner(deployer);
    const instance = await factory.connect(signer).deploy(...constructorArgs, {
        gasPrice,
        maxPriorityFeePerGas,
        maxFeePerGas,
    });
    const deployTx = instance.deploymentTransaction();
    if (deployTx) {
        await deployTx.wait(waitConfirmations);
    }
    await instance.waitForDeployment();
    const address = await instance.getAddress();
    if (log) console.log(`${contractName} deployed to: ${address}`);

    if (env) {
        const artifact = await artifacts.readArtifact(contractName);
        await env.save(deploymentName, {
            address: address as `0x${string}`,
            abi: artifact.abi,
            bytecode: artifact.bytecode,
            deployedBytecode: artifact.deployedBytecode,
            args: constructorArgs,
            transactionHash: deployTx?.hash as `0x${string}` | undefined,
        } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    if (!(skipVerify || constants.DEV_CHAINS.includes(networkName))) {
        await hre.tasks.getTask('verify').run({
            address,
            constructorArgsParams: constructorArgs,
        });
    } else if (log) {
        console.log('Skipping verification');
    }

    return instance as unknown as Contract;
}

/**
 * @category utils
 * Deploys a contract using create3 and saves the deployment information.
 */
export async function deployAndGetContractWithCreate3(
    options: DeployContractOptionsWithCreate3,
): Promise<Contract> {
    const {
        create3Deployer,
        salt,
        contractName,
        constructorArgs = [],
        txSigner,
        deploymentName = contractName,
        skipVerify = false,
        skipIfAlreadyDeployed = true,
        gasPrice,
        maxPriorityFeePerGas,
        maxFeePerGas,
        waitConfirmations = 1,
    } = options;
    const env = resolveEnv(options);
    const signer = txSigner ?? (await ethers.getSigners())[0];
    const networkName = (await network.getOrCreate()).networkName;

    const artifact = await artifacts.readArtifact(contractName);
    if (skipIfAlreadyDeployed && env) {
        const contractDeployment = env.getOrNull(contractName);
        if (contractDeployment != null && artifact.deployedBytecode === contractDeployment.deployedBytecode) {
            console.log(`Contract ${contractName} is already deployed at ${contractDeployment.address}`);
            return await ethers.getContractAt(contractName, contractDeployment.address);
        }
    }

    const deployer = await ethers.getContractAt('ICreate3Deployer', create3Deployer) as unknown as ICreate3Deployer;
    const CustomContract = await ethers.getContractFactory(contractName);
    const deployData = (await CustomContract.getDeployTransaction(...constructorArgs)).data;

    const txn = await deployer.connect(signer).deploy(salt, deployData, { gasPrice, maxPriorityFeePerGas, maxFeePerGas });
    const receipt = await txn.wait(waitConfirmations) as TransactionReceipt;

    const customContractAddress = await deployer.addressOf(salt);
    console.log(`${contractName} deployed to: ${customContractAddress}`);

    return await saveContractWithCreate3Deployment(
        signer.provider as JsonRpcProvider,
        env,
        contractName,
        deploymentName,
        constructorArgs,
        salt,
        create3Deployer,
        receipt.hash,
        skipVerify || constants.DEV_CHAINS.includes(networkName),
    );
}

/**
 * @category utils
 * Saves the deployment information using the deploy transaction hash.
 */
export async function saveContractWithCreate3Deployment(
    provider: JsonRpcProvider | { getTransactionReceipt: (hash: string) => Promise<TransactionReceipt | null> },
    env: Environment | undefined,
    contractName: string,
    deploymentName: string,
    constructorArgs: any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    salt: string,
    create3Deployer: string,
    deployTxHash: string,
    skipVerify: boolean = false,
): Promise<Contract> {
    const deployer = await ethers.getContractAt('ICreate3Deployer', create3Deployer);
    const contract = await deployer.addressOf(salt);
    const receipt = await provider.getTransactionReceipt(deployTxHash);
    const artifact = await artifacts.readArtifact(contractName);

    if (env) {
        await env.save(deploymentName, {
            address: contract as `0x${string}`,
            abi: artifact.abi,
            bytecode: artifact.bytecode,
            deployedBytecode: artifact.deployedBytecode,
            args: constructorArgs,
            transactionHash: (receipt?.hash || deployTxHash) as `0x${string}`,
            receipt,
        } as any, { considerItAsFreshDeployment: true }); // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    const networkName = (await network.getOrCreate()).networkName;
    if (!(skipVerify || constants.DEV_CHAINS.includes(networkName))) {
        await hre.tasks.getTask('verify').run({
            address: contract,
            constructorArgsParams: constructorArgs,
        });
    } else {
        console.log('Skipping verification');
    }

    return await ethers.getContractAt(contractName, contract);
}

/**
 * @category utils
 * Advances the blockchain time to a specific timestamp for testing purposes.
 */
export async function timeIncreaseTo(seconds: number | string): Promise<void> {
    const delay = 1000 - new Date().getMilliseconds();
    await new Promise((resolve) => setTimeout(resolve, delay));
    await time.increaseTo(seconds);
}

/**
 * @category utils
 * Deploys a contract given a name and optional constructor parameters.
 */
export async function deployContract(name: string, parameters: Array<BigNumberish> = []) : Promise<BaseContract> {
    const ContractFactory = await ethers.getContractFactory(name);
    const instance = await ContractFactory.deploy(...parameters);
    await instance.waitForDeployment();
    return instance;
}

/**
 * @category utils
 * Deploys a contract from bytecode.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deployContractFromBytecode(abi: any[], bytecode: BytesLike, parameters: Array<BigNumberish> = [], signer?: Signer) : Promise<BaseContract> {
    const ContractFactory = await ethers.getContractFactory(abi, bytecode, signer);
    const instance = await ContractFactory.deploy(...parameters);
    await instance.waitForDeployment();
    return instance;
}

/**
 * @category utils
 * Token interface for trackReceivedTokenAndTx.
 */
export type Token = {
    balanceOf: (address: string) => Promise<bigint>;
    getAddress: () => Promise<string>;
}

export type TrackReceivedTokenAndTxResult = [bigint, ContractTransactionReceipt | TrackReceivedTokenAndTxResult];

/**
 * @category utils
 * Tracks token balance changes and transaction receipts.
 */
export async function trackReceivedTokenAndTx<T extends unknown[]>(
    provider: JsonRpcProvider | { getBalance: (address: string) => Promise<bigint> },
    token: Token | { address: typeof constants.ZERO_ADDRESS } | { address: typeof constants.EEE_ADDRESS },
    wallet: string,
    txPromise: (...args: T) => Promise<ContractTransactionResponse | TrackReceivedTokenAndTxResult>,
    ...args: T
) : Promise<TrackReceivedTokenAndTxResult> {
    const tokenAddress = 'address' in token ? token.address : await token.getAddress();
    const isETH = tokenAddress === constants.ZERO_ADDRESS || tokenAddress === constants.EEE_ADDRESS;
    const getBalance = 'balanceOf' in token ? token.balanceOf.bind(token) : provider.getBalance.bind(provider);

    const preBalance: bigint = await getBalance(wallet);
    const txResponse = await txPromise(...args);
    const txReceipt = 'wait' in txResponse ? await txResponse.wait() : txResponse[1] as ContractTransactionReceipt;
    const txFees = wallet.toLowerCase() === txReceipt!.from.toLowerCase() && isETH
        ? txReceipt!.gasUsed * txReceipt!.gasPrice
        : 0n;
    const postBalance: bigint = await getBalance(wallet);
    return [postBalance - preBalance + txFees, 'wait' in txResponse ? txReceipt! : txResponse];
}

/**
 * @category utils
 * Corrects the ECDSA signature 'v' value according to Ethereum's standard.
 */
export function fixSignature(signature: string): string {
    let v = parseInt(signature.slice(130, 132), 16);
    if (v < 27) {
        v += 27;
    }
    const vHex = v.toString(16);
    return signature.slice(0, 130) + vHex;
}

/**
 * @category utils
 * Signs a message with a given signer and fixes the signature format.
 */
export async function signMessage(
    signer: Wallet | { signMessage: (messageHex: string | Uint8Array) => Promise<string> },
    messageHex: string | Uint8Array = '0x',
): Promise<string> {
    return fixSignature(await signer.signMessage(messageHex));
}

/**
 * @category utils
 * Counts occurrences of EVM instructions in a transaction trace.
 */
export async function countInstructions(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider: JsonRpcProvider | { send: (method: string, params: unknown[]) => Promise<any> },
    txHash: string,
    instructions: string[],
): Promise<number[]> {
    const trace = await provider.send('debug_traceTransaction', [txHash]);
    const str = JSON.stringify(trace);
    return instructions.map((instr) => {
        return str.split('"' + instr.toUpperCase() + '"').length - 1;
    });
}

/**
 * @category utils
 * Retrieves the current USD price of a native token from Coinbase.
 */
export async function getEthPrice(nativeTokenSymbol: string = 'ETH'): Promise<bigint> {
    type CoinbaseResponse = {
        data: {
            amount: string;
        };
    };
    const response = await fetch(`https://api.coinbase.com/v2/prices/${nativeTokenSymbol}-USD/spot`);
    try {
        return BigInt(parseFloat((await response.json() as CoinbaseResponse).data.amount) * 1e18);
    } catch {
        throw new Error('Failed to parse price from Coinbase API');
    }
}

/**
 * @category utils
 * Sets custom bytecode for local test accounts and returns them as signers.
 */
export async function getAccountsWithCode(code: BytesLike|Array<BytesLike|undefined> = '0x'): Promise<HardhatEthersSigner[]> {
    const accounts = await ethers.getSigners();
    for (let i = 0; i < accounts.length; i++) {
        const newAccountCode = isBytesLike(code)
            ? code
            : (code[i] ?? '0x');
        await setCode(
            accounts[i].address,
            typeof newAccountCode === 'string' ? newAccountCode : hexlify(newAccountCode),
        );
    }
    return accounts;
}
