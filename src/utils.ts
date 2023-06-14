import { constants } from './prelude';
import hre, { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { providers, Wallet, Contract, Bytes, ContractTransaction, BigNumberish, BigNumber } from 'ethers';
import { Deployment, DeployOptions, DeployResult } from 'hardhat-deploy/types';

const _delay = (ms: number ) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

const _tryRun = async (f: () => Promise<any>, n = 10) => {
    const delayMs = 2000;
    if (typeof f !== 'function') {
        throw Error('f is not a function');
    }

    for (let i = 0; ; i++) {
        try {
            return await f();
        } catch (error) {
            console.error(error);
            await _delay(delayMs);
            if (i > n) {
                throw new Error(`Couldn't verify deploy in ${n} runs`);
            }
        }
    }
};

const _getContract = async (contractName: string, contractAddress: string): Promise<Contract> => {
    const contractFactory = await ethers.getContractFactory(contractName);
    return contractFactory.attach(contractAddress);
};

interface DeployContractOptions {
    contractName: string;
    constructorArgs: any[];
    deployments: {
        deploy: (name: string, options: DeployOptions) => Promise<DeployResult>;
        getOrNull: (name: string) => Promise<Deployment | null>
    },
    deployer: string;
    deploymentName?: string;
    skipVerify?: boolean;
    skipIfAlreadyDeployed?: boolean;
    gasPrice?: BigNumber;
    maxPriorityFeePerGas?: BigNumber;
    maxFeePerGas?: BigNumber;
}

export async function deployUnverified({
    contractName,
    constructorArgs,
    deployments,
    deployer,
    deploymentName = contractName,
    skipIfAlreadyDeployed = true,
    gasPrice,
    maxPriorityFeePerGas,
    maxFeePerGas,
}: DeployContractOptions): Promise<DeployResult | Deployment> {
    /**
     * Deploys a contract using hardhat-deploy plugin.
     * @remarks
     * This function will skip deployment if there is a deployment with the same name and `skipIfAlreadyDeployed` is true.
     * Thus, even if the contract bytecode changes, the contract will not be redeployed.
     */
    const { deploy, getOrNull } = deployments;

    const existingContract = await getOrNull(deploymentName);
    if (existingContract && skipIfAlreadyDeployed) {
        console.log(`Skipping deploy for existing contract ${contractName} (${deploymentName}) at address: ${existingContract.address}`);
        return existingContract;
    }

    const deployOptions: DeployOptions = {
        args: constructorArgs,
        from: deployer,
        contract: contractName,
        skipIfAlreadyDeployed,
        gasPrice,
        maxPriorityFeePerGas,
        maxFeePerGas,
    };

    const contract = await deploy(deploymentName, deployOptions);

    console.log(`${deploymentName} deployed to: ${contract.address}`);
    return contract;
}

export async function deployAndVerify({
    contractName,
    constructorArgs,
    deployments,
    deployer,
    deploymentName = contractName,
    skipIfAlreadyDeployed = true,
    gasPrice,
    maxPriorityFeePerGas,
    maxFeePerGas,
}: DeployContractOptions): Promise<DeployResult | Deployment> {
    /**
     * Deploys contract and tries to verify it on Etherscan.
     * @remarks
     * If the contract is deployed on a dev chain, verification is skipped.
     */
    const deployResult = await deployUnverified({
        contractName,
        constructorArgs,
        deployments,
        deployer,
        deploymentName,
        skipIfAlreadyDeployed,
        gasPrice,
        maxPriorityFeePerGas,
        maxFeePerGas,
    });

    if (!constants.DEV_CHAINS.includes(hre.network.name)) {
        await _delay(2000);
        await _tryRun(() =>
            hre.run('verify:verify', {
                address: deployResult.address,
                constructorArguments: constructorArgs,
            }),
        );
    } else {
        console.log('Skipping verification');
    }

    return deployResult;
}

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
}: DeployContractOptions): Promise<Contract> {
    /**
     * Deploys contract and tries to verify it on Etherscan if requested.
     * @returns Deployed contract instance
     */
    const deployOptions: DeployContractOptions = {
        contractName,
        constructorArgs,
        deployments,
        deployer,
        deploymentName,
        skipIfAlreadyDeployed,
        gasPrice,
        maxPriorityFeePerGas,
        maxFeePerGas,
    };
    const deployResult = await (skipVerify ? deployUnverified(deployOptions) : deployAndVerify(deployOptions));
    return _getContract(contractName, deployResult.address);
}

export async function timeIncreaseTo(seconds: number | string) {
    const delay = 1000 - new Date().getMilliseconds();
    await _delay(delay);
    await time.increaseTo(seconds);
}

export async function deployContract(name: string, parameters: Array<BigNumberish> = []) {
    const ContractFactory = await ethers.getContractFactory(name);
    const instance = await ContractFactory.deploy(...parameters);
    await instance.deployed();
    return instance;
}

export async function trackReceivedTokenAndTx<T extends unknown[]>(
    provider: providers.JsonRpcProvider,
    token: Contract | { address: typeof constants.ZERO_ADDRESS } | { address: typeof constants.EEE_ADDRESS },
    wallet: string,
    txPromise: (...args: T) => Promise<ContractTransaction>,
    ...args: T
) {
    const isETH = token.address === constants.ZERO_ADDRESS || token.address === constants.EEE_ADDRESS;
    const getBalance = 'balanceOf' in token ? token.balanceOf : provider.getBalance;

    const preBalance = await getBalance(wallet);
    const txResult = await txPromise(...args);
    const postBalance = await getBalance(wallet);

    if ('wait' in txResult) {
        const txReceipt = await txResult.wait();
        const txFees =
            wallet.toLowerCase() === txResult.from.toLowerCase() && isETH
                ? txReceipt.gasUsed.toBigInt() * txReceipt.effectiveGasPrice.toBigInt()
                : 0n;
        return [postBalance.sub(preBalance).add(txFees), txReceipt];
    } else {
        return [postBalance.sub(preBalance), txResult];
    }
}

export function fixSignature(signature: string) {
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

export async function signMessage(signer: Wallet, messageHex: string | Bytes = '0x') {
    return fixSignature(await signer.signMessage(messageHex));
}

export async function countInstructions(
    provider: providers.JsonRpcProvider,
    txHash: string,
    instructions: string[]
) {
    const trace = await provider.send('debug_traceTransaction', [txHash]);

    const str = JSON.stringify(trace);

    return instructions.map((instr) => {
        return str.split('"' + instr.toUpperCase() + '"').length - 1;
    });
}
