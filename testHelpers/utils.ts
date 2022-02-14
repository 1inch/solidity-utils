import { web3 } from "hardhat";
import types from "../typechain-types";
import { toBN } from 'web3-utils';
const { constants, time } = require('@openzeppelin/test-helpers');
import { promisify } from 'util';

export async function timeIncreaseTo (seconds: number) {
    const delay = 1000 - new Date().getMilliseconds();
    await new Promise(resolve => setTimeout(resolve, delay));
    await time.increaseTo(seconds);
}

export interface Token extends Truffle.ContractInstance {
    balanceOf(
        account: string,
        txDetails?: Truffle.TransactionDetails
      ): Promise<BN>;
}

export async function trackReceivedTokenAndTx<T extends unknown[]>(token: Token, wallet: string, txPromise: (...args: T) => any, ...args: T) {
    const isETH = token.address === constants.ZERO_ADDRESS || token.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const preBalance = isETH ? toBN(await web3.eth.getBalance(wallet)) : await token.balanceOf(wallet);
    const txResult = await txPromise(...args);
    const txFees = (wallet.toLowerCase() === txResult.receipt.from.toLowerCase() && isETH)
        ? web3.utils.toBN(txResult.receipt.gasUsed).mul(web3.utils.toBN(txResult.receipt.effectiveGasPrice))
        : web3.utils.toBN('0');
    const postBalance = isETH ? web3.utils.toBN(await web3.eth.getBalance(wallet)) : await token.balanceOf(wallet);
    return [postBalance.sub(preBalance).add(txFees), txResult];
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

// signs message in node (ganache auto-applies "Ethereum Signed Message" prefix)
export async function signMessage (signer: string, messageHex = '0x') {
    return fixSignature(await web3.eth.sign(messageHex, signer));
}

export async function countInstructions(txHash: string, instructions: string[]){
    if (!web3.currentProvider) {
        throw new Error("Provider not set");
    }
    const trace = await promisify((web3.currentProvider as {send: any}).send.bind(web3.currentProvider))({
        jsonrpc: '2.0',
        method: 'debug_traceTransaction',
        params: [txHash, {}],
        id: new Date().getTime(),
    });

    const str = JSON.stringify(trace);

    return instructions.map(instr => {
        return str.split('"' + instr.toUpperCase() + '"').length - 1;
    });
}

