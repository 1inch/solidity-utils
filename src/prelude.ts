import { parseUnits } from 'ethers';
import { getNetworkConnection } from './network.js';

export const constants = {
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
    EEE_ADDRESS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    ZERO_BYTES32: '0x0000000000000000000000000000000000000000000000000000000000000000',
    MAX_UINT256: 2n ** 256n - 1n,
    MAX_INT256: 2n ** 255n - 1n,
    MAX_UINT48: 2n ** 48n - 1n,
    MIN_INT256: -(2n ** 255n),
    MAX_UINT128: 2n ** 128n - 1n,
    MAX_UINT32: 2n ** 32n - 1n,
    DEV_CHAINS: ['hardhat', 'localhost', 'default', 'hardhatMainnet'] as string[],
} as const;

/**
 * Lazy proxy to Hardhat 3 `networkHelpers.time`.
 * Methods are async and resolve against the cached network connection.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const time: any = new Proxy(
    {},
    {
        get(_target, prop: string | symbol) {
            return async (...args: unknown[]) => {
                const { networkHelpers } = await getNetworkConnection();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const value = (networkHelpers.time as any)[prop];
                if (typeof value === 'function') {
                    return value.apply(networkHelpers.time, args);
                }
                return value;
            };
        },
    },
);

/**
 * @category prelude
 * Converts an Ether amount represented as a string into its Wei equivalent as a bigint.
 * @param n The amount of Ether to convert, specified as a string.
 * @return The equivalent amount in Wei as a bigint.
 */
export function ether(n: string): bigint {
    return parseUnits(n);
}
