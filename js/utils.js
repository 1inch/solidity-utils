const { constants, time } = require('@openzeppelin/test-helpers');
const { promisify } = require('util');

async function timeIncreaseTo (seconds) {
    const delay = 1000 - new Date().getMilliseconds();
    await new Promise(resolve => setTimeout(resolve, delay));
    await time.increaseTo(seconds);
}

async function trackReceivedToken (token, wallet, txPromise, ...args) {
    return (await trackReceivedTokenAndTx(token, wallet, txPromise, ...args))[0];
}

async function trackReceivedTokenAndTx (token, wallet, txPromise, ...args) {
    const isETH = token.address === constants.ZERO_ADDRESS || token.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
    const preBalance = web3.utils.toBN(isETH ? await web3.eth.getBalance(wallet) : await token.balanceOf(wallet));
    const txResult = await txPromise(...args);
    const txFees = (wallet.toLowerCase() === txResult.receipt.from.toLowerCase() && isETH)
        ? web3.utils.toBN(txResult.receipt.gasUsed).mul(web3.utils.toBN(txResult.receipt.effectiveGasPrice))
        : web3.utils.toBN('0');
    const postBalance = web3.utils.toBN(isETH ? await web3.eth.getBalance(wallet) : await token.balanceOf(wallet));
    return [postBalance.sub(preBalance).add(txFees), txResult];
}

function fixSignature (signature) {
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
async function signMessage (signer, messageHex = '0x') {
    return fixSignature(await web3.eth.sign(messageHex, signer));
}

async function countInstructions (txHash, instruction) {
    const trace = await promisify(web3.currentProvider.send.bind(web3.currentProvider))({
        jsonrpc: '2.0',
        method: 'debug_traceTransaction',
        params: [txHash, {}],
        id: new Date().getTime(),
    });

    const str = JSON.stringify(trace);

    if (Array.isArray(instruction)) {
        return instruction.map(instr => {
            return str.split('"' + instr.toUpperCase() + '"').length - 1;
        });
    }

    return str.split('"' + instruction.toUpperCase() + '"').length - 1;
}

module.exports = {
    timeIncreaseTo,
    trackReceivedToken,
    trackReceivedTokenAndTx,
    fixSignature,
    signMessage,
    countInstructions,
};
