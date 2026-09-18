import { network } from 'hardhat';

export type AppNetworkConnection = Awaited<ReturnType<typeof network.getOrCreate>>;

/**
 * Returns the shared Hardhat 3 network connection (ethers + networkHelpers + provider).
 * Uses getOrCreate so library helpers and tests talk to the same chain.
 */
export async function getNetworkConnection(): Promise<AppNetworkConnection> {
    return network.getOrCreate();
}

/**
 * Convenience accessor for connection.ethers.
 */
export async function getEthers() {
    return (await getNetworkConnection()).ethers;
}
