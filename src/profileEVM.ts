import { PathLike, promises as fs } from 'fs';
import { JsonRpcProvider } from 'ethers';

/**
 * @category profileEVM
 * @dev Default configuration options for the `gasspectEVM` function to analyze gas usage in EVM transactions.
 * @property minOpGasCost The minimal gas cost of operations to be returned in the analysis. Defaults to 300, filtering out less costly operations for clarity.
 * @property args Boolean indicating whether to return the arguments of each operation in the analysis. Defaults to `false`, omitting arguments for simplicity.
 * @property res Boolean indicating whether to return the results of each operation in the analysis. Defaults to `false`, omitting results to focus on gas usage.
 */
export const gasspectOptionsDefault = {
    minOpGasCost: 300,
    args: false,
    res: false,
};

type Op = {
    traceAddress: number[];
    depth: number;
    gasCost: number;
    args?: unknown[];
    res: unknown;
    op: string;
    gas: number;
    stack: string[];
    memory: string[];
};

/** @internal */
function _normalizeOp(ops: Op[], i: number): void {
    if (ops[i].op === 'STATICCALL') {
        ops[i].gasCost = ops[i].gasCost - ops[i + 1].gas;

        if (
            ops[i].stack.length > 8 &&
            ops[i].stack[ops[i].stack.length - 8] === '0000000000000000000000000000000000000000000000000000000000000001'
        ) {
            ops[i].op = 'STATICCALL-ECRECOVER';
        } else if (
            ops[i].stack.length > 8 &&
            ops[i].stack[ops[i].stack.length - 8] <= '00000000000000000000000000000000000000000000000000000000000000FF'
        ) {
            ops[i].op = 'STATICCALL-' + ops[i].stack[ops[i].stack.length - 8].substr(62, 2);
        } else {
            ops[i].args = [
                '0x' + ops[i].stack[ops[i].stack.length - 2].substring(24),
                '0x' +
                    (ops[i].memory || [])
                        .join('')
                        .substr(
                            2 * Number(ops[i].stack[ops[i].stack.length - 3]),
                            2 * Number(ops[i].stack[ops[i].stack.length - 4]),
                        ),
            ];
            if (ops[i].gasCost === 100) {
                ops[i].op += '_R';
            }
        }
    }
    if (['CALL', 'DELEGATECALL', 'CALLCODE'].indexOf(ops[i].op) !== -1) {
        ops[i].args = [
            '0x' + ops[i].stack[ops[i].stack.length - 2].substring(24),
            '0x' +
                (ops[i].memory || [])
                    .join('')
                    .substr(
                        2 * Number(ops[i].stack[ops[i].stack.length - 4]),
                        2 * Number(ops[i].stack[ops[i].stack.length - 5]),
                    ),
        ];
        ops[i].gasCost = ops[i].gasCost - ops[i + 1].gas;
        ops[i].res = ops[i + 1].stack[ops[i + 1].stack.length - 1];

        if (ops[i].gasCost === 100) {
            ops[i].op += '_R';
        }
    }
    if (['RETURN', 'REVERT', 'INVALID'].indexOf(ops[i].op) !== -1) {
        ops[i].gasCost = 3;
    }
    if (['SSTORE', 'SLOAD'].indexOf(ops[i].op) !== -1) {
        ops[i].args = ['0x' + ops[i].stack[ops[i].stack.length - 1]];
        if (ops[i].op === 'SSTORE') {
            ops[i].args!.push('0x' + ops[i].stack[ops[i].stack.length - 2]);
        }
        if (ops[i].gasCost === 100) {
            ops[i].op += '_R';
        }
        if (ops[i].gasCost >= 20000) {
            ops[i].op += '_I';
        }

        if (ops[i].op.startsWith('SLOAD')) {
            ops[i].res = ops[i + 1].stack[ops[i + 1].stack.length - 1];
        }
    }
    if (ops[i].op === 'EXTCODESIZE') {
        ops[i].args = ['0x' + ops[i].stack[ops[i].stack.length - 1].substring(24)];
        ops[i].res = ops[i + 1].stack[ops[i + 1].stack.length - 1];
    }
}

/**
 * @category profileEVM
 * @notice Profiles EVM execution by counting occurrences of specified instructions in a transaction's execution trace.
 * @param provider An Ethereum provider capable of sending custom RPC requests.
 * @param txHash The hash of the transaction to profile.
 * @param instruction An array of EVM instructions (opcodes) to count within the transaction's execution trace.
 * @param optionalTraceFile An optional file path or handle where the full transaction trace will be saved.
 * @return An array of numbers representing the counts of each instruction specified, in the order they were provided.
 */
export async function profileEVM(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider: JsonRpcProvider | { send: (method: string, params: unknown[]) => Promise<any> },
    txHash: string, instruction: string[],
    optionalTraceFile?: PathLike | fs.FileHandle
): Promise<number[]> {
    const trace = await provider.send('debug_traceTransaction', [txHash]);

    const str = JSON.stringify(trace);

    if (optionalTraceFile) {
        await fs.writeFile(optionalTraceFile, str);
    }

    return instruction.map((instr) => {
        return str.split('"' + instr.toUpperCase() + '"').length - 1;
    });
}

/**
 * @category profileEVM
 * @notice Performs gas analysis on EVM transactions, highlighting operations that exceed a specified gas cost.
 * Analyzes gas usage by operations within a transaction, applying filters and formatting based on options.
 * @param provider The Ethereum JSON RPC provider or any custom provider with a `send` method.
 * @param txHash Transaction hash to analyze.
 * @param gasspectOptions Analysis configuration, specifying filters and formatting for gas analysis. See `gasspectOptionsDefault` for default values.
 * @param optionalTraceFile Optional path or handle to save the detailed transaction trace.
 * @return A detailed string array of operations meeting the criteria set in `gasspectOptions`.
 */
export async function gasspectEVM(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provider: JsonRpcProvider | { send: (method: string, params: unknown[]) => Promise<any> },
    txHash: string,
    gasspectOptions: Record<string, unknown> = {},
    optionalTraceFile?: PathLike | fs.FileHandle
): Promise<string[]> {
    const options = { ...gasspectOptionsDefault, ...gasspectOptions };

    const trace = await provider.send('debug_traceTransaction', [txHash]);

    const ops: Op[] = trace.structLogs;

    const traceAddress = [0, -1];
    for (const [i, op] of ops.entries()) {
        op.traceAddress = traceAddress.slice(0, traceAddress.length - 1);
        _normalizeOp(ops, i);

        if (op.depth + 2 > traceAddress.length) {
            traceAddress[traceAddress.length - 1] += 1;
            traceAddress.push(-1);
        }

        if (op.depth + 2 < traceAddress.length) {
            traceAddress.pop();
        }
    }

    const result = ops
        .filter((op) => op.gasCost > options.minOpGasCost)
        .map(
            (op) =>
                op.traceAddress.join('-') +
                '-' +
                op.op +
                (options.args ? '(' + (op.args || []).join(',') + ')' : '') +
                (options.res ? (op.res ? ':0x' + op.res : '') : '') +
                ' = ' +
                op.gasCost,
        );

    if (optionalTraceFile) {
        await fs.writeFile(optionalTraceFile, JSON.stringify(trace));
    }

    return result;
}
