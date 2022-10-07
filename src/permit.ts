import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';
import { constants } from './prelude';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { splitSignature } from 'ethers/lib/utils';

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

export function trim0x(bigNumber: bigint | string) {
    const s = bigNumber.toString();
    if (s.startsWith('0x')) {
        return s.substring(2);
    }
    return s;
}

export function cutSelector(data: string) {
    const hexPrefix = '0x';
    return hexPrefix + data.substr(hexPrefix.length + 8);
}

export function domainSeparator(name: string, version: string, chainId: string, verifyingContract: string) {
    return (
        '0x' +
        TypedDataUtils.hashStruct(
            'EIP712Domain',
            { name, version, chainId, verifyingContract },
            { EIP712Domain },
            TypedDataVersion,
        ).toString('hex')
    );
}

export function buildData(
    name: string,
    version: string,
    chainId: number,
    verifyingContract: string,
    owner: string,
    spender: string,
    value: string,
    nonce: string,
    deadline: string = defaultDeadline.toString(),
) {
    return {
        types: { Permit },
        domain: { name, version, chainId, verifyingContract },
        message: { owner, spender, value, nonce, deadline },
    } as const;
}

export function buildDataLikeDai(
    name: string,
    version: string,
    chainId: number,
    verifyingContract: string,
    holder: string,
    spender: string,
    nonce: string,
    allowed: boolean,
    expiry: string = defaultDeadline.toString(),
) {
    return {
        types: { Permit: DaiLikePermit },
        domain: { name, version, chainId, verifyingContract },
        message: { holder, spender, nonce, expiry, allowed },
    } as const;
}

/*
 * @param permitContract The contract object with ERC20Permit type and token address for which the permit creating.
 */
export async function getPermit(
    owner: SignerWithAddress,
    permitContract: Contract,
    tokenVersion: string,
    chainId: number,
    spender: string,
    value: string,
    deadline = defaultDeadline.toString(),
) {
    const nonce = await permitContract.nonces(owner.address);
    const name = await permitContract.name();
    const data = buildData(
        name,
        tokenVersion,
        chainId,
        permitContract.address,
        owner.address,
        spender,
        value,
        nonce.toString(),
        deadline,
    );
    const signature = await owner._signTypedData(data.domain, data.types, data.message);
    const { v, r, s } = splitSignature(signature);
    const permitCall = permitContract.interface.encodeFunctionData('permit', [
        owner.address,
        spender,
        value,
        deadline,
        v,
        r,
        s,
    ]);
    return cutSelector(permitCall);
}

/*
 * @param permitContract The contract object with ERC20PermitLikeDai type and token address for which the permit creating.
 */
export async function getPermitLikeDai(
    holder: SignerWithAddress,
    permitContract: Contract,
    tokenVersion: string,
    chainId: number,
    spender: string,
    allowed: boolean,
    expiry = defaultDeadline.toString(),
) {
    const nonce = await permitContract.nonces(holder.address);
    const name = await permitContract.name();
    const data = buildDataLikeDai(
        name,
        tokenVersion,
        chainId,
        permitContract.address,
        holder.address,
        spender,
        nonce.toString(),
        allowed,
        expiry,
    );
    const signature = await holder._signTypedData(data.domain, data.types, data.message);
    const { v, r, s } = splitSignature(signature);
    const permitCall = permitContract.interface.encodeFunctionData(
        'permit(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)',
        [holder.address, spender, nonce, expiry, allowed, v, r, s],
    );
    return cutSelector(permitCall);
}

export function withTarget(target: bigint | string, data: bigint | string) {
    return target.toString() + trim0x(data);
}
