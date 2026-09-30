import hre, { artifacts, network } from 'hardhat';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import type { Abi } from 'hardhat/types/artifacts';
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
 * Minimal deployment data persisted by the deployment helpers.
 * @category utils
 * @param address Deployed contract address.
 * @param abi Contract ABI.
 * @param bytecode Contract creation bytecode.
 * @param deployedBytecode Runtime bytecode.
 * @param args Constructor arguments.
 * @param transactionHash Deployment transaction hash.
 * @param receipt Deployment transaction receipt.
 * @param numDeployments Number of deployments recorded under this name.
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
 * @param contractName Name of the Hardhat contract artifact to deploy.
 * @param constructorArgs Constructor arguments. Defaults to an empty array.
 * @param env Rocketh environment used to persist deployment records.
 * @param deployments Deprecated alias for `env`, retained for hardhat-deploy v1 migration.
 * @param deployer Address of the signer that deploys the contract.
 * @param deploymentName Name used to store the deployment. Defaults to `contractName`.
 * @param skipVerify Whether to skip block explorer verification. Defaults to `false`.
 * @param skipIfAlreadyDeployed Whether to reuse an existing deployment from `env`. Defaults to `true`.
 * @param gasPrice Legacy gas price for the deployment transaction.
 * @param maxPriorityFeePerGas EIP-1559 priority fee for the deployment transaction.
 * @param maxFeePerGas EIP-1559 maximum fee for the deployment transaction.
 * @param log Whether to log deployment and verification status. Defaults to `true`.
 * @param waitConfirmations Confirmations to await. Defaults to 1 on development chains and 6 otherwise.
 */
export interface DeployContractOptions {
    contractName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructorArgs?: any[];
    env?: Environment;
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
 * @param txSigner Signer that sends the CREATE3 deployment transaction. Defaults to the first Hardhat signer.
 * @param create3Deployer Address of the `ICreate3Deployer` contract.
 * @param salt CREATE3 salt used to derive the deployed contract address.
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
 * Deploys a contract, optionally persists it in Rocketh, and verifies it on a block explorer.
 * Existing records are reused when `skipIfAlreadyDeployed` is enabled.
 * @param options Deployment and verification options.
 * @returns The deployed or previously persisted contract instance.
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
 * Deploys a contract through CREATE3 and optionally persists the deployment in Rocketh.
 * @param options CREATE3 deployment and verification options. Confirmations default to 1.
 * @returns The deployed or previously persisted contract instance.
 */
export async function deployAndGetContractWithCreate3(
    options: DeployContractOptionsWithCreate3,
): Promise<Contract> {
    const networkName = (await network.getOrCreate()).networkName;
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
        waitConfirmations = constants.DEV_CHAINS.includes(networkName) ? 1 : 6,
    } = options;
    const env = resolveEnv(options);
    const signer = txSigner ?? (await ethers.getSigners())[0];

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
 * The contract address is derived from the CREATE3 deployer and salt.
 * @param provider Provider used to retrieve the deployment transaction receipt.
 * @param env Optional Rocketh environment in which to save the deployment.
 * @param contractName Name of the Hardhat contract artifact.
 * @param deploymentName Name used to store the deployment.
 * @param constructorArgs Constructor arguments used for deployment and verification.
 * @param salt CREATE3 salt used to derive the deployed address.
 * @param create3Deployer Address of the `ICreate3Deployer` contract.
 * @param deployTxHash Hash of the CREATE3 deployment transaction.
 * @param skipVerify Whether to skip block explorer verification.
 * @returns A contract instance connected to the derived address.
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
 * @param seconds Target timestamp accepted by Hardhat's `time.increaseTo`.
 */
export async function timeIncreaseTo(seconds: number | string): Promise<void> {
    const delay = 1000 - new Date().getMilliseconds();
    await new Promise((resolve) => setTimeout(resolve, delay));
    await time.increaseTo(seconds);
}

/**
 * @category utils
 * Deploys a contract given a name and optional constructor parameters.
 * @param name Name of the Hardhat contract artifact.
 * @param parameters Constructor arguments. Defaults to an empty array.
 * @returns The deployed contract instance.
 */
export async function deployContract(name: string, parameters: Array<BigNumberish> = []) : Promise<BaseContract> {
    const ContractFactory = await ethers.getContractFactory(name);
    const instance = await ContractFactory.deploy(...parameters);
    await instance.waitForDeployment();
    return instance;
}

/**
 * @category utils
 * Deploys a contract directly from its ABI and bytecode.
 * This is useful for tests and for bytecode without a named Hardhat artifact.
 * @param abi Contract ABI.
 * @param bytecode Contract creation bytecode.
 * @param parameters Constructor arguments. Defaults to an empty array.
 * @param signer Optional signer used to deploy the contract.
 * @returns The deployed contract instance.
 */
export async function deployContractFromBytecode(abi: Abi, bytecode: BytesLike, parameters: Array<BigNumberish> = [], signer?: Signer) : Promise<BaseContract> {
    const ContractFactory = await ethers.getContractFactory(abi, bytecode, signer);
    const instance = await ContractFactory.deploy(...parameters);
    await instance.waitForDeployment();
    return instance;
}

/**
 * @category utils
 * Token interface for trackReceivedTokenAndTx.
 * @param balanceOf Returns the token balance of an account.
 * @param getAddress Returns the token contract address.
 */
export type Token = {
    balanceOf: (address: string) => Promise<bigint>;
    getAddress: () => Promise<string>;
}

/**
 * Result returned by `trackReceivedTokenAndTx`.
 * The first item is the received amount. The second item is either the transaction
 * receipt or a nested result returned by another `trackReceivedTokenAndTx` call.
 * @category utils
 */
export type TrackReceivedTokenAndTxResult = [bigint, ContractTransactionReceipt | TrackReceivedTokenAndTxResult];

/**
 * @category utils
 * Tracks the amount of ERC-20 tokens or native currency received while executing a transaction.
 * Calls can be nested by returning another `TrackReceivedTokenAndTxResult` from `txPromise`.
 * Native-currency transaction fees are added back when the tracked wallet sends the transaction.
 * @param provider Provider used to read native-currency balances.
 * @param token Token contract, `ZERO_ADDRESS`, or `EEE_ADDRESS` for native currency.
 * @param wallet Address whose balance change is measured.
 * @param txPromise Function that sends a transaction or returns a nested tracking result.
 * @param args Arguments forwarded to `txPromise`.
 * @returns The received amount and transaction receipt or nested tracking result.
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
 * Geth returns 27 or 28, while some clients return 0 or 1. Values below 27 are
 * shifted to prevent signature malleability caused by mixed representations.
 * @param signature Hex-encoded 65-byte ECDSA signature.
 * @returns The signature with a normalized `v` value.
 * @see https://github.com/ethereum/go-ethereum/blob/v1.8.23/internal/ethapi/api.go#L465
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
 * @param signer Wallet or compatible message signer.
 * @param messageHex Message bytes or hex string. Defaults to `0x`.
 * @returns The signature with a normalized `v` value.
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
 * @param provider Provider that supports `debug_traceTransaction`.
 * @param txHash Transaction hash to trace.
 * @param instructions Opcode names to count, case-insensitively.
 * @returns Counts in the same order as `instructions`.
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
 * Retrieves the current USD spot price of a native token from Coinbase.
 * Intended for tests that need a current reference price while preserving bigint precision.
 * @param nativeTokenSymbol Native token symbol. Defaults to `ETH`.
 * @returns The USD price multiplied by 1e18.
 * @throws If the Coinbase response does not contain a parseable amount.
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
 * This is useful when EIP-7702 or another fixture leaves code on default accounts
 * and a test requires empty or explicitly controlled account bytecode.
 * @param code One bytecode value for every account, or one optional value per account. Defaults to `0x`.
 * @returns Hardhat signers whose account code has been updated.
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
