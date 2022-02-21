import { MessageTypes, signTypedData, SignTypedDataVersion, TypedDataUtils, TypedMessage } from '@metamask/eth-sig-util';
import { fromRpcSig } from 'ethereumjs-util';
import { Token } from './utils';
import { constants } from './prelude';


export const TypedDataVersion = SignTypedDataVersion.V4;
export const defaultDeadline = constants.MAX_UINT256;

export const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
];

export const Permit = [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
];

export const DaiLikePermit = [
    { name: 'holder', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
    { name: 'allowed', type: 'bool' },
];

export function trim0x (bigNumber: BN | string) {
    const s = bigNumber.toString();
    if (s.startsWith('0x')) {
        return s.substring(2);
    }
    return s;
}

export function cutSelector (data: string) {
    const hexPrefix = '0x';
    return hexPrefix + data.substr(hexPrefix.length + 8);
}

export function domainSeparator (name: string, version: string, chainId: string, verifyingContract: string) {
    return '0x' + TypedDataUtils.hashStruct(
        'EIP712Domain',
        { name, version, chainId, verifyingContract },
        { EIP712Domain },
        TypedDataVersion
    ).toString('hex');
}

export function buildData (
    name: string,
    version: string,
    chainId: number,
    verifyingContract: string,
    owner: string,
    spender: string,
    value: string,
    nonce: string,
    deadline: string = defaultDeadline) {
    return {
        primaryType: 'Permit',
        types: { EIP712Domain, Permit },
        domain: { name, version, chainId, verifyingContract },
        message: { owner, spender, value, nonce, deadline },
    } as const;
}

export function buildDataLikeDai (name: string,
    version: string,
    chainId: number,
    verifyingContract: string,
    holder: string,
    spender: string,
    nonce: string,
    allowed: boolean,
    expiry: string = defaultDeadline) {
    return {
        primaryType: 'Permit',
        types: { EIP712Domain, Permit: DaiLikePermit },
        domain: { name, version, chainId, verifyingContract },
        message: { holder, spender, nonce, expiry, allowed },
    } as const;
}

export interface PermittableToken extends Token {
    nonces(owner: string, txDetails?: Truffle.TransactionDetails): Promise<BN>;
    name(txDetails?: Truffle.TransactionDetails): Promise<string>;
}

export function signWithPk<T extends MessageTypes> (privateKey: string, data: TypedMessage<T>) {
    return signTypedData({ privateKey: Buffer.from(trim0x(privateKey), 'hex'), data, version: TypedDataVersion });
}

/*
 * @param permitContract The contract object with ERC20Permit type and token address for which the permit creating.
 */
export async function getPermit (
    owner: string,
    ownerPrivateKey: string,
    permitContract: PermittableToken,
    tokenVersion: string,
    chainId: number,
    spender: string,
    value: string,
    deadline = defaultDeadline) {
    const nonce = await permitContract.nonces(owner);
    const name = await permitContract.name();
    const data = buildData(name, tokenVersion, chainId, permitContract.address, owner, spender, value, nonce.toString(), deadline);
    const signature = signWithPk(ownerPrivateKey, data);
    const { v, r, s } = fromRpcSig(signature);
    const permitCall = permitContract.contract.methods.permit(owner, spender, value, deadline, v, r, s).encodeABI();
    return cutSelector(permitCall);
}

/*
 * @param permitContract The contract object with ERC20PermitLikeDai type and token address for which the permit creating.
 */
export async function getPermitLikeDai (
    holder: string,
    holderPrivateKey: string,
    permitContract: PermittableToken,
    tokenVersion: string,
    chainId: number,
    spender: string,
    allowed: boolean, expiry = defaultDeadline) {
    const nonce = await permitContract.nonces(holder);
    const name = await permitContract.name();
    const data = buildDataLikeDai(name, tokenVersion, chainId, permitContract.address, holder, spender, nonce.toString(), allowed, expiry);
    const signature = signWithPk(holderPrivateKey, data);
    const { v, r, s } = fromRpcSig(signature);
    const permitCall = permitContract.contract.methods.permit(holder, spender, nonce, expiry, allowed, v, r, s).encodeABI();
    return cutSelector(permitCall);
}

export function withTarget (target: BN | string, data: BN | string) {
    return target.toString() + trim0x(data);
}
