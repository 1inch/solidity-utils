import '@nomicfoundation/hardhat-ethers';  // required to populate the HardhatRuntimeEnvironment with ethers
import hre, { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { BaseContract, BigNumberish, BytesLike, Contract, ContractTransactionReceipt, ContractTransactionResponse, JsonRpcProvider, Signer, Wallet } from 'ethers';
import { DeployOptions, DeployResult } from 'hardhat-deploy/types';

import { constants } from './prelude';

interface DeployContractOptions {
    contractName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructorArgs?: any[];
    deployments: { deploy: (name: string, options: DeployOptions) => Promise<DeployResult> },
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
 * @notice Deploys a contract with optional Etherscan verification.
 * @param contractName Name of the contract to deploy.
 * @param constructorArgs Arguments for the contract's constructor.
 * @param deployments Deployment facilitator object from Hardhat.
 * @param deployer Address deploying the contract.
 * @param deploymentName Optional custom name for deployment; defaults to contract name.
 * @param skipVerify Skips Etherscan verification if true.
 * @param skipIfAlreadyDeployed Avoids redeployment if contract already deployed.
 * @param gasPrice, maxPriorityFeePerGas, maxFeePerGas Gas strategy options.
 * @param log Toggles deployment logging.
 * @param waitConfirmations Number of confirmations to wait based on network. Ussually it's need for waiting before Etherscan verification.
 * @returns The deployed contract instance.
 */
export async function deployAndGetContract({
    contractName,
    constructorArgs,
    deployments,
    deployer,
    deploymentName = contractName,
    skipVerify = false,
    skipIfAlreadyDeployed = true,
    gasPrice,
    maxPriorityFeePerGas,
    maxFeePerGas,
    log = true,
    waitConfirmations = constants.DEV_CHAINS.includes(hre.network.name) ? 1 : 6,
}: DeployContractOptions): Promise<Contract> {
    /**
     * Deploys contract and tries to verify it on Etherscan if requested.
     * @remarks
     * If the contract is deployed on a dev chain, verification is skipped.
     * @returns Deployed contract instance
     */
    const { deploy } = deployments;

    const deployOptions: DeployOptions = {
        args: constructorArgs,
        from: deployer,
        contract: contractName,
        skipIfAlreadyDeployed,
        gasPrice: gasPrice?.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas?.toString(),
        maxFeePerGas: maxFeePerGas?.toString(),
        log,
        waitConfirmations,
    };
    const deployResult: DeployResult = await deploy(deploymentName, deployOptions);

    if (!(skipVerify || constants.DEV_CHAINS.includes(hre.network.name))) {
        await hre.run('verify:verify', {
            address: deployResult.address,
            constructorArguments: constructorArgs,
        });
    } else {
        console.log('Skipping verification');
    }
    return await ethers.getContractAt(contractName, deployResult.address);
}

/**
 * @category utils
 * @notice Advances the blockchain time to a specific timestamp for testing purposes.
 * @param seconds Target time in seconds or string format to increase to.
 */
export async function timeIncreaseTo(seconds: number | string): Promise<void> {
    const delay = 1000 - new Date().getMilliseconds();
    await new Promise((resolve) => setTimeout(resolve, delay));
    await time.increaseTo(seconds);
}

/**
 * @category utils
 * @notice Deploys a contract given a name and optional constructor parameters.
 * @param name The contract name.
 * @param parameters Constructor parameters for the contract.
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
 * @notice Deploys a contract from bytecode, useful for testing and deployment of minimal proxies.
 * @param abi Contract ABI.
 * @param bytecode Contract bytecode.
 * @param parameters Constructor parameters.
 * @param signer Optional signer object.
 * @returns The deployed contract instance.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deployContractFromBytecode(abi: any[], bytecode: BytesLike, parameters: Array<BigNumberish> = [], signer?: Signer) : Promise<BaseContract> {
    const ContractFactory = await ethers.getContractFactory(abi, bytecode, signer);
    const instance = await ContractFactory.deploy(...parameters);
    await instance.waitForDeployment();
    return instance;
}

type Token = {
    balanceOf: (address: string) => Promise<bigint>;
    getAddress: () => Promise<string>;
}

type TrackReceivedTokenAndTxResult = [bigint, ContractTransactionReceipt | TrackReceivedTokenAndTxResult];

/**
 * @category utils
 * @notice Tracks token balance changes and transaction receipts for specified wallet addresses during test scenarios.
 * It could be used recursively for multiple tokens via specific `txPromise` function.
 * @param provider JSON RPC provider or custom provider object.
 * @param token Token contract instance or ETH address constants.
 * @param wallet Wallet address to track.
 * @param txPromise Function returning a transaction promise.
 * @param args Arguments for the transaction promise function.
 * @returns Tuple of balance change and transaction receipt.
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
 * @notice Corrects the ECDSA signature 'v' value according to Ethereum's standard.
 * @param signature The original signature string.
 * @returns The corrected signature string.
 */
export function fixSignature(signature: string): string {
    // in geth its always 27/28, in ganache its 0/1. Change to 27/28 to prevent
    // signature malleability if version is 0/1
    // see https://github.com/ethereum/go-ethereum/blob/v1.8.23/internal/ethapi/api.go#L465
    let v = parseInt(signature.slice(130, 132), 16);
    if (v < 27) {
        v += 27;
    }
    const vHex = v.toString(16);
    return signature.slice(0, 130) + vHex;
}

/**
 * @category utils
 * @notice Signs a message with a given signer and fixes the signature format.
 * @param signer Signer object or wallet instance.
 * @param messageHex The message to sign, in hex format.
 * @returns The signed message string.
 */
export async function signMessage(
    signer: Wallet | { signMessage: (messageHex: string | Uint8Array) => Promise<string> },
    messageHex: string | Uint8Array = '0x'
): Promise<string> {
    return fixSignature(await signer.signMessage(messageHex));
}

/**
 * @category utils
 * @notice Counts the occurrences of specified EVM instructions in a transaction's execution trace.
 * @param provider JSON RPC provider or custom provider object.
 * @param txHash Transaction hash to analyze.
 * @param instructions Array of EVM instructions (opcodes) to count.
 * @returns Array of instruction counts.
 */
export async function countInstructions(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider: JsonRpcProvider | { send: (method: string, params: unknown[]) => Promise<any> },
    txHash: string,
    instructions: string[]
): Promise<number[]> {
    const trace = await provider.send('debug_traceTransaction', [txHash]);

    const str = JSON.stringify(trace);

    return instructions.map((instr) => {
        return str.split('"' + instr.toUpperCase() + '"').length - 1;
    });
}
