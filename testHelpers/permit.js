const { constants } = require('@openzeppelin/test-helpers');
const ethSigUtil = require('eth-sig-util');
const { fromRpcSig } = require('ethereumjs-util');

const defaultDeadline = constants.MAX_UINT256;

const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
];

const Permit = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
];

const DaiLikePermit = [
    { name: 'holder', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
    { name: 'allowed', type: 'bool' },
];

function trim0x (bigNumber) {
    const s = bigNumber.toString();
    if (s.startsWith('0x')) {
        return s.substring(2);
    }
    return s;
}

function cutSelector (data) {
    const hexPrefix = '0x';
    return hexPrefix + data.substr(hexPrefix.length + 8);
}

function domainSeparator (name, version, chainId, verifyingContract) {
    return '0x' + ethSigUtil.TypedDataUtils.hashStruct(
        'EIP712Domain',
        { name, version, chainId, verifyingContract },
        { EIP712Domain },
    ).toString('hex');
}

function buildData (name, version, chainId, verifyingContract, owner, spender, value, nonce, deadline = defaultDeadline) {
    return {
        primaryType: 'Permit',
        types: { EIP712Domain, Permit },
        domain: { name, version, chainId, verifyingContract },
        message: { owner, spender, value, nonce, deadline },
    };
}

function buildDataLikeDai (name, version, chainId, verifyingContract, holder, spender, nonce, allowed, expiry = defaultDeadline) {
    return {
        primaryType: 'Permit',
        types: { EIP712Domain, Permit: DaiLikePermit },
        domain: { name, version, chainId, verifyingContract },
        message: { holder, spender, nonce, expiry, allowed },
    };
}

/*
 * @param permitContract The contract object with ERC20Permit type and token address for which the permit creating.
 */
async function getPermit (owner, ownerPrivateKey, permitContract, tokenVersion, chainId, spender, value, deadline = defaultDeadline) {
    const nonce = await permitContract.nonces(owner);
    const name = await permitContract.name();
    const data = buildData(name, tokenVersion, chainId, permitContract.address, owner, spender, value, nonce, deadline);
    const signature = ethSigUtil.signTypedMessage(Buffer.from(trim0x(ownerPrivateKey), 'hex'), { data });
    const { v, r, s } = fromRpcSig(signature);
    const permitCall = permitContract.contract.methods.permit(owner, spender, value, deadline, v, r, s).encodeABI();
    return cutSelector(permitCall);
}

/*
 * @param permitContract The contract object with ERC20PermitLikeDai type and token address for which the permit creating.
 */
async function getPermitLikeDai (holder, holderPrivateKey, permitContract, tokenVersion, chainId, spender, allowed, expiry = defaultDeadline) {
    const nonce = await permitContract.nonces(holder);
    const name = await permitContract.name();
    const data = buildDataLikeDai(name, tokenVersion, chainId, permitContract.address, holder, spender, nonce, allowed, expiry);
    const signature = ethSigUtil.signTypedMessage(Buffer.from(trim0x(holderPrivateKey), 'hex'), { data });
    const { v, r, s } = fromRpcSig(signature);
    const permitCall = permitContract.contract.methods.permit(holder, spender, nonce, expiry, allowed, v, r, s).encodeABI();
    return cutSelector(permitCall);
}

function withTarget (target, data) {
    return target.toString() + trim0x(data);
}

module.exports = {
    defaultDeadline,
    EIP712Domain,
    Permit,
    DaiLikePermit,
    trim0x,
    domainSeparator,
    buildData,
    buildDataLikeDai,
    getPermit,
    getPermitLikeDai,
    withTarget,
};
