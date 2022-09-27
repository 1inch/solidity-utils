import { constants } from './prelude';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { BaseContract, BigNumber, Bytes, CallOverrides, ContractTransaction } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

export async function timeIncreaseTo (seconds: number | string) {
    const delay = 1000 - new Date().getMilliseconds();
    await new Promise(resolve => setTimeout(resolve, delay));
    await time.increaseTo(seconds);
}

export interface Token extends BaseContract {
    balanceOf(
        account: string,
        overrides?: CallOverrides
    ): Promise<BigNumber>;
}

export async function trackReceivedTokenAndTx<T extends unknown[]> (
    token: Token | {address: typeof constants.ZERO_ADDRESS} | {address: typeof constants.EEE_ADDRESS},
    wallet: string,
    txPromise: (...args: T) => Promise<ContractTransaction>,
    ...args: T
) {
    const [balanceFunc, isETH] =
            'balanceOf' in token
                ? [() => token.balanceOf(wallet), false]
                : [async () => (await ethers.provider.getBalance(wallet)), true];
    const preBalance = await balanceFunc();
    const txResult = await txPromise(...args);
    const txReceipt = await txResult.wait();
    const txFees = (wallet.toLowerCase() === txResult.from.toLowerCase() && isETH)
        ? txReceipt.gasUsed.toBigInt() * txReceipt.effectiveGasPrice.toBigInt()
        : 0n;
    const postBalance = await balanceFunc();
    return [postBalance.sub(preBalance).add(txFees), txResult] as const;
}

export function fixSignature (signature: string) {
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

export async function signMessage (signer: SignerWithAddress, messageHex: string | Bytes = '0x') {
    return fixSignature(await signer.signMessage(messageHex));
}

export async function countInstructions (txHash: string, instructions: string[]) {
    const trace = await ethers.provider.send('debug_traceTransaction', [ txHash ]);

    const str = JSON.stringify(trace);

    return instructions.map(instr => {
        return str.split('"' + instr.toUpperCase() + '"').length - 1;
    });
}
