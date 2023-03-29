import '@nomiclabs/hardhat-ethers';
import { SignTypedDataVersion, TypedDataUtils } from '@metamask/eth-sig-util';
import { constants } from './prelude';
import { Contract, Wallet } from 'ethers';
import { ethers } from 'hardhat';
import { splitSignature } from 'ethers/lib/utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { AllowanceTransfer, PERMIT2_ADDRESS } from '@uniswap/permit2-sdk';
import { bytecode as permit2Bytecode } from './permit2.json';

export const TypedDataVersion = SignTypedDataVersion.V4;
export const defaultDeadline = constants.MAX_UINT256;
export const defaultDeadlinePermit2 = constants.MAX_UINT48;

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

export async function permit2Contract() {
    if ((await ethers.provider.getCode(PERMIT2_ADDRESS)) === '0x') {
        await ethers.provider.send('hardhat_setCode', [PERMIT2_ADDRESS, permit2Bytecode]);
    }
    return ethers.getContractAt('IPermit2', PERMIT2_ADDRESS);
}

/*
 * @param permitContract The contract object with ERC20Permit type and token address for which the permit creating.
 */
export async function getPermit(
    owner: Wallet | SignerWithAddress,
    permitContract: Contract,
    tokenVersion: string,
    chainId: number,
    spender: string,
    value: string,
    deadline = defaultDeadline.toString(),
    compact = false,
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
    const permitCall = cutSelector(permitContract.interface.encodeFunctionData('permit', [owner.address, spender, value, deadline, v, r, s]));
    return compact ? compressPermit(permitCall) : decompressPermit(compressPermit(permitCall), constants.ZERO_ADDRESS, owner.address, spender);
}

/*
 * @param permit2Contract The contract object for Permit2 Uniswap contract.
 */
export async function getPermit2(
    owner: Wallet | SignerWithAddress,
    token: string,
    chainId: number,
    spender: string,
    amount: bigint,
    compact = false,
    expiration = defaultDeadlinePermit2,
    sigDeadline = defaultDeadlinePermit2,
) {
    const permitContract = await permit2Contract();
    const nonce = (await permitContract.allowance(owner.address, token, spender)).nonce;
    const details = {
        token,
        amount,
        expiration,
        nonce,
    };
    const permitSingle = {
        details,
        spender,
        sigDeadline,
    };
    const data = AllowanceTransfer.getPermitData(permitSingle, permitContract.address, chainId);
    const { r, _vs } = ethers.utils.splitSignature(await owner._signTypedData(data.domain, data.types, data.values));
    const permitCall = cutSelector(permitContract.interface.encodeFunctionData('permit', [owner.address, permitSingle, r + trim0x(_vs)]));
    return compact ? compressPermit(permitCall) : decompressPermit(compressPermit(permitCall), token, owner.address, spender);
}

/*
 * @param permitContract The contract object with ERC20PermitLikeDai type and token address for which the permit creating.
 */
export async function getPermitLikeDai(
    holder: Wallet | SignerWithAddress,
    permitContract: Contract,
    tokenVersion: string,
    chainId: number,
    spender: string,
    allowed: boolean,
    expiry = defaultDeadline.toString(),
    compact = false,
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
    const permitCall = cutSelector(permitContract.interface.encodeFunctionData(
        'permit(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)',
        [holder.address, spender, nonce, expiry, allowed, v, r, s],
    ));
    return compact ? compressPermit(permitCall) : decompressPermit(compressPermit(permitCall), constants.ZERO_ADDRESS, holder.address, spender);
}

export function withTarget(target: bigint | string, data: bigint | string) {
    return target.toString() + trim0x(data);
}

// Type | EIP-2612 | DAI | Permit2
// Uncompressed | 224 | 256 | 352
// Compressed | 100 | 72 | 96

export function compressPermit(permit: string) {
    const abiCoder = ethers.utils.defaultAbiCoder;
    switch (permit.length) {
    case 450: {
        // IERC20Permit.permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s)
        const args = abiCoder.decode(['address owner', 'address spender', 'uint256 value', 'uint256 deadline', 'uint8 v', 'bytes32 r', 'bytes32 s'], permit);
        // Compact IERC20Permit.permit(uint256 value, uint32 deadline, uint256 r, uint256 vs)
        return '0x' + args.value.toBigInt().toString(16).padStart(64, '0') +
                (args.deadline.toString() === constants.MAX_UINT256.toString() ? '00000000' : (args.expiry.toBigInt() + 1n).toString(16).padStart(8, '0')) +
                BigInt(args.r).toString(16).padStart(64, '0') +
                ((BigInt(args.v - 27) << 255n) | BigInt(args.s)).toString(16).padStart(64, '0');
    }
    case 514: {
        // IDaiLikePermit.permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s)
        const args = abiCoder.decode(['address holder', 'address spender', 'uint256 nonce', 'uint256 expiry', 'bool allowed', 'uint8 v', 'bytes32 r', 'bytes32 s'], permit);
        // Compact IDaiLikePermit.permit(uint32 nonce, uint32 expiry, uint256 r, uint256 vs)
        return '0x' + args.nonce.toBigInt().toString(16).padStart(8, '0') +
                (args.expiry.toString() === constants.MAX_UINT256.toString() ? '00000000' : (args.expiry.toBigInt() + 1n).toString(16).padStart(8, '0')) +
                BigInt(args.r).toString(16).padStart(64, '0') +
                ((BigInt(args.v - 27) << 255n) | BigInt(args.s)).toString(16).padStart(64, '0');
    }
    case 706: {
        // IPermit2.permit(address owner, PermitSingle calldata permitSingle, bytes calldata signature)
        const args = abiCoder.decode(['address owner', 'address token', 'uint160 amount', 'uint48 expiration', 'uint48 nonce', 'address spender', 'uint256 sigDeadline', 'bytes signature'], permit);
        // Compact IPermit2.permit(uint160 amount, uint32 expiration, uint32 nonce, uint32 sigDeadline, uint256 r, uint256 vs)
        return '0x' + args.amount.toBigInt().toString(16).padStart(40, '0') +
                (args.expiration.toString() === constants.MAX_UINT48.toString() ? '00000000' : (args.expiration.toBigInt() + 1n).toString(16).padStart(8, '0')) +
                args.nonce.toString(16).padStart(8, '0') +
                (args.sigDeadline.toString() === constants.MAX_UINT48.toString() ? '00000000' : (args.sigDeadline.toBigInt() + 1n).toString(16).padStart(8, '0')) +
                BigInt(args.signature).toString(16).padStart(128, '0');
    }
    case 202:
    case 146:
    case 194:
        throw new Error('Permit is already compressed');
    default:
        throw new Error('Invalid permit length');
    }
}

export function decompressPermit(permit: string, token: string, owner: string, spender: string) {
    const abiCoder = ethers.utils.defaultAbiCoder;
    switch (permit.length) {
    case 202: {
        // Compact IERC20Permit.permit(uint256 value, uint32 deadline, uint256 r, uint256 vs)
        const args = {
            value: BigInt(permit.slice(0, 66)),
            deadline: BigInt('0x' + permit.slice(66, 74)),
            r: '0x' + permit.slice(74, 138),
            vs: BigInt('0x' + permit.slice(138, 202)),
        };
        // IERC20Permit.permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s)
        return abiCoder.encode(
            ['address owner', 'address spender', 'uint256 value', 'uint256 deadline', 'uint8 v', 'bytes32 r', 'bytes32 s'],
            [
                owner,
                spender,
                args.value,
                args.deadline === 0n ? constants.MAX_UINT256 : args.deadline - 1n,
                Number(args.vs >> 255n) + 27,
                args.r,
                '0x' + (args.vs & 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn).toString(16),
            ],
        );
    }
    case 146: {
        // Compact IDaiLikePermit.permit(uint32 nonce, uint32 expiry, uint256 r, uint256 vs)
        const args = {
            nonce: BigInt(permit.slice(0, 10)),
            expiry: BigInt('0x' + permit.slice(10, 18)),
            r: '0x' + permit.slice(18, 82),
            vs: BigInt('0x' + permit.slice(82, 146)),
        };
        // IDaiLikePermit.permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s)
        return abiCoder.encode(
            ['address holder', 'address spender', 'uint256 nonce', 'uint256 expiry', 'bool allowed', 'uint8 v', 'bytes32 r', 'bytes32 s'],
            [
                owner,
                spender,
                args.nonce,
                args.expiry === 0n ? constants.MAX_UINT256 : args.expiry - 1n,
                true,
                Number(args.vs >> 255n) + 27,
                args.r,
                '0x' + (args.vs & 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn).toString(16),
            ],
        );
    }
    case 194: {
        // Compact IPermit2.permit(uint160 amount, uint32 expiration, uint32 nonce, uint32 sigDeadline, uint256 r, uint256 vs)
        const args = {
            amount: BigInt(permit.slice(0, 42)),
            expiration: BigInt('0x' + permit.slice(42, 50)),
            nonce: BigInt('0x' + permit.slice(50, 58)),
            sigDeadline: BigInt('0x' + permit.slice(58, 66)),
            r: '0x' + permit.slice(66, 130),
            vs: '0x' + permit.slice(130, 194),
        };
        // IPermit2.permit(address owner, PermitSingle calldata permitSingle, bytes calldata signature)
        return abiCoder.encode(
            ['address owner', 'address token', 'uint160 amount', 'uint48 expiration', 'uint48 nonce', 'address spender', 'uint256 sigDeadline', 'bytes signature'],
            [
                owner,
                token,
                args.amount,
                args.expiration === 0n ? constants.MAX_UINT48 : args.expiration - 1n,
                args.nonce,
                spender,
                args.sigDeadline === 0n ? constants.MAX_UINT48 : args.sigDeadline - 1n,
                args.r + trim0x(args.vs),
            ],
        );
    }
    case 450:
    case 514:
    case 706:
        throw new Error('Permit is already decompressed');
    default:
        throw new Error('Invalid permit length');
    }
}
