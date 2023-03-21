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

    if (compact) {
        if (BigInt(deadline) !== constants.MAX_UINT256 && BigInt(deadline) >= (1n << 32n)) {
            throw new Error('Deadline is too big for the compact mode');
        }
        return '0x' +
            BigInt(value).toString(16).padStart(64, '0') +
            (deadline === constants.MAX_UINT256.toString() ? '00000000' : (BigInt(deadline) + 1n).toString(16).padStart(8, '0')) +
            BigInt(r).toString(16).padStart(64, '0') +
            (BigInt(s) | (BigInt(v - 27) << 255n)).toString(16).padStart(64, '0');
    }

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
    const signature = await owner._signTypedData(data.domain, data.types, data.values);
    const { r, _vs } = ethers.utils.splitSignature(signature);
    if (compact) {
        return '0x' +
            amount.toString(16).padStart(40, '0') +
            (expiration === constants.MAX_UINT48 ? '00000000' : (BigInt(expiration) + 1n).toString(16).padStart(8, '0')) +
            BigInt(nonce).toString(16).padStart(8, '0') +
            (sigDeadline === constants.MAX_UINT48 ? '00000000' : (BigInt(sigDeadline) + 1n).toString(16).padStart(8, '0')) +
            BigInt(r).toString(16).padStart(64, '0') +
            BigInt(_vs).toString(16).padStart(64, '0');
    }
    const permitCall = await permitContract.populateTransaction.permit(owner.address, permitSingle, signature);
    return cutSelector(permitCall.data!);
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

    if (compact) {
        if (BigInt(expiry) !== constants.MAX_UINT256 && BigInt(expiry) >= (1n << 32n)) {
            throw new Error('Expiry is too big for the compact mode');
        }
        return '0x' +
            BigInt(nonce).toString(16).padStart(8, '0') +
            (expiry === constants.MAX_UINT256.toString() ? '00000000' : (BigInt(expiry) + 1n).toString(16).padStart(8, '0')) +
            BigInt(r).toString(16).padStart(64, '0') +
            (BigInt(s) | (BigInt(v - 27) << 255n)).toString(16).padStart(64, '0');
    }

    const permitCall = permitContract.interface.encodeFunctionData(
        'permit(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)',
        [holder.address, spender, nonce, expiry, allowed, v, r, s],
    );
    return cutSelector(permitCall);
}

export function withTarget(target: bigint | string, data: bigint | string) {
    return target.toString() + trim0x(data);
}

// Type | EIP-2612 | DAI | Permit2
// Uncompressed | 224 | 256 | 384
// Compressed | 100 | 72 | 96

export function compressPermit(permit: string) {
    const abiCoder = ethers.utils.defaultAbiCoder;
    switch (permit.length) {
        case 224: {
            // IERC20Permit.permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s)
            const args = abiCoder.decode(['address owner', 'address spender', 'uint256 value', 'uint256 deadline', 'uint8 v', 'bytes32 r', 'bytes32 s'], permit);
            // Compact IERC20Permit.permit(uint256 value, uint32 deadline, uint256 r, uint256 vs)
            return BigInt(args.value).toString(16).padStart(64, '0') +
                BigInt(args.deadline).toString(16).padStart(8, '0') +
                BigInt(args.r).toString(16).padStart(64, '0') +
                ((BigInt(args.v - 27) << 255n) | BigInt(args.s)).toString(16).padStart(64, '0');
        }
        case 256: {
            // IDaiLikePermit.permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s)
            const args = abiCoder.decode(['address holder', 'address spender', 'uint256 nonce', 'uint256 expiry', 'bool allowed', 'uint8 v', 'bytes32 r', 'bytes32 s'], permit);
            // Compact IDaiLikePermit.permit(uint32 nonce, uint32 expiry, uint256 r, uint256 vs)
            return BigInt(args.nonce).toString(16).padStart(8, '0') +
                (args.expiry === constants.MAX_UINT256.toString() ? '00000000' : (BigInt(args.expiry) + 1n).toString(16).padStart(8, '0')) +
                BigInt(args.r).toString(16).padStart(64, '0') +
                ((BigInt(args.v - 27) << 255n) | BigInt(args.s)).toString(16).padStart(64, '0');
        }
        case 384: {
            // IPermit2.permit(address owner, PermitSingle calldata permitSingle, bytes calldata signature)
            const args = abiCoder.decode(['address owner', 'address token', 'uint160 amount', 'uint48 expiration', 'uint48 nonce', 'address spender', 'uint256 sigDeadline'], permit);
            // Compact IPermit2.permit(uint160 amount, uint32 expiration, uint32 nonce, uint32 sigDeadline, uint256 r, uint256 vs)
            return BigInt(args.amount).toString(16).padStart(40, '0') +
                (args.expiration === constants.MAX_UINT48.toString() ? '00000000' : (BigInt(args.expiration) + 1n).toString(16).padStart(8, '0')) +
                BigInt(args.nonce).toString(16).padStart(8, '0') +
                (args.sigDeadline === constants.MAX_UINT48.toString() ? '00000000' : (BigInt(args.sigDeadline) + 1n).toString(16).padStart(8, '0')) +
                BigInt(args.r).toString(16).padStart(64, '0') +
                ((BigInt(args.v - 27) << 255n) | BigInt(args.s)).toString(16).padStart(64, '0');
        }
        case 100:
        case 72:
        case 96:
            throw new Error('Permit is already compressed');
        default:
            throw new Error('Invalid permit length');
    }
}

export function decompressPermit(permit: string, token: string, owner: string, spender: string) {
    const abiCoder = ethers.utils.defaultAbiCoder;
    switch (permit.length) {
        case 100: {
            // Compact IERC20Permit.permit(uint256 value, uint32 deadline, uint256 r, uint256 vs)
            const args = {
                value: BigInt('0x' + permit.slice(0, 66)),
                deadline: BigInt('0x' + permit.slice(66, 74)),
                r: BigInt('0x' + permit.slice(74, 138)),
                vs: BigInt('0x' + permit.slice(138, 202)),
            };
            // IERC20Permit.permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s)
            return abiCoder.encode(
                ['address owner', 'address spender', 'uint256 value', 'uint256 deadline', 'uint8 v', 'bytes32 r', 'bytes32 s'],
                [ owner, spender, args.value, args.deadline, Number(args.vs >> 255n) + 27, args.r, args.vs & 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn],
            );
        }
        case 72: {
            // Compact IDaiLikePermit.permit(uint32 nonce, uint32 expiry, uint256 r, uint256 vs)
            const args = {
                nonce: BigInt('0x' + permit.slice(0, 18)),
                expiry: BigInt('0x' + permit.slice(18, 26)),
                r: BigInt('0x' + permit.slice(26, 90)),
                vs: BigInt('0x' + permit.slice(90, 154)),
            };
            // IDaiLikePermit.permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s)
            return abiCoder.encode(
                ['address holder', 'address spender', 'uint256 nonce', 'uint256 expiry', 'bool allowed', 'uint8 v', 'bytes32 r', 'bytes32 s'],
                [ owner, spender, args.nonce, args.expiry === 0n ? constants.MAX_UINT256 : args.expiry - 1n, true, Number(args.vs >> 255n) + 27, args.r, args.vs & 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn],
            );
        }
        case 96: {
            // Compact IPermit2.permit(uint160 amount, uint32 expiration, uint32 nonce, uint32 sigDeadline, uint256 r, uint256 vs)
            const args = {
                amount: BigInt('0x' + permit.slice(0, 42)),
                expiration: BigInt('0x' + permit.slice(42, 50)),
                nonce: BigInt('0x' + permit.slice(50, 58)),
                sigDeadline: BigInt('0x' + permit.slice(58, 66)),
                r: BigInt('0x' + permit.slice(66, 130)),
                vs: BigInt('0x' + permit.slice(130, 194)),
            };
            // IPermit2.permit(address owner, PermitSingle calldata permitSingle, bytes calldata signature)
            return abiCoder.encode(
                ['address owner', 'address token', 'uint160 amount', 'uint48 expiration', 'uint48 nonce', 'address spender', 'uint256 sigDeadline'],
                [ owner, token, args.amount, args.expiration === 0n ? constants.MAX_UINT48 : args.expiration - 1n, args.nonce, spender, args.sigDeadline === 0n ? constants.MAX_UINT48 : args.sigDeadline - 1n],
            ) + abiCoder.encode(
                ['uint8 v', 'bytes32 r', 'bytes32 s'],
                [ Number(args.vs >> 255n) + 27, args.r, args.vs & 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn],
            );
        }
        case 224:
        case 256:
        case 384:
            throw new Error('Permit is already decompressed');
        default:
            throw new Error('Invalid permit length');
    }
}
