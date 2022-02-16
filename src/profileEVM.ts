import { promisify } from 'util';
import { PathLike, promises as fs } from 'fs';
import { toBN } from './prelude';

export const gasspectOptionsDefault = {
    minOpGasCost: 300, // minimal gas cost of returned operations
    args: false, // return operations arguments
    res: false, // return operations results
};

type Op = {
    traceAddress: number[],
    depth: number,
    gasCost: number,
    args?: unknown[],
    res: unknown,
    op: string,
    gas: number
    stack: string[],
    memory: string[]
};

function _normalizeOp (ops: Op[], i: number) {
    if (ops[i].op === 'STATICCALL') {
        ops[i].gasCost = ops[i].gasCost - ops[i + 1].gas;

        if (ops[i].stack.length > 8 && ops[i].stack[ops[i].stack.length - 8] === '0000000000000000000000000000000000000000000000000000000000000001') {
            ops[i].op = 'STATICCALL-ECRECOVER';
        } else if (ops[i].stack.length > 8 && ops[i].stack[ops[i].stack.length - 8] <= '00000000000000000000000000000000000000000000000000000000000000FF') {
            ops[i].op = 'STATICCALL-' + ops[i].stack[ops[i].stack.length - 8].substr(62, 2);
        } else {
            ops[i].args = [
                '0x' + ops[i].stack[ops[i].stack.length - 2].substr(24),
                '0x' + (ops[i].memory || []).join('').substr(
                    2 * toBN(ops[i].stack[ops[i].stack.length - 3]).toNumber(),
                    2 * toBN(ops[i].stack[ops[i].stack.length - 4]).toNumber(),
                ),
            ];
            if (ops[i].gasCost === 100) {
                ops[i].op += '_R';
            }
        }
    }
    if (['CALL', 'DELEGATECALL', 'CALLCODE'].indexOf(ops[i].op) !== -1) {
        ops[i].args = [
            '0x' + ops[i].stack[ops[i].stack.length - 2].substr(24),
            '0x' + (ops[i].memory || []).join('').substr(
                2 * toBN(ops[i].stack[ops[i].stack.length - 4]).toNumber(),
                2 * toBN(ops[i].stack[ops[i].stack.length - 5]).toNumber(),
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
        ops[i].args = [
            '0x' + ops[i].stack[ops[i].stack.length - 1],
        ];
        if (ops[i].op === 'SSTORE') {
            ops[i].args!.push('0x' + ops[i].stack[ops[i].stack.length - 2]);
        }
        if (ops[i].gasCost === 100) {
            ops[i].op += '_R';
        }
        if (ops[i].gasCost === 20000) {
            ops[i].op += '_I';
        }

        if (ops[i].op.startsWith('SLOAD')) {
            ops[i].res = ops[i + 1].stack[ops[i + 1].stack.length - 1];
        }
    }
    if (ops[i].op === 'EXTCODESIZE') {
        ops[i].args = [
            '0x' + ops[i].stack[ops[i].stack.length - 1].substr(24),
        ];
        ops[i].res = ops[i + 1].stack[ops[i + 1].stack.length - 1];
    }
}

export async function profileEVM (txHash: string, instruction: string[], optionalTraceFile?: PathLike | fs.FileHandle) {
    if (!web3.currentProvider || typeof web3.currentProvider === 'string' || !web3.currentProvider.send) {
        throw new Error('Unsupported provider');
    }

    const trace = await promisify(web3.currentProvider.send.bind(web3.currentProvider))({
        jsonrpc: '2.0',
        method: 'debug_traceTransaction',
        params: [txHash, {}],
        id: new Date().getTime(),
    });

    const str = JSON.stringify(trace);

    if (optionalTraceFile) {
        await fs.writeFile(optionalTraceFile, str);
    }

    return instruction.map(instr => {
        return str.split('"' + instr.toUpperCase() + '"').length - 1;
    });
}

export async function gasspectEVM (txHash: string, gasspectOptions: Record<string, unknown> = {}, optionalTraceFile?: PathLike | fs.FileHandle) {
    const options = { ...gasspectOptionsDefault, ...gasspectOptions };

    if (!web3.currentProvider) {
        throw new Error('Provider not set');
    }

    if (!web3.currentProvider || typeof web3.currentProvider === 'string' || !web3.currentProvider.send) {
        throw new Error('Unsupported provider');
    }

    const trace = await promisify(web3.currentProvider.send.bind(web3.currentProvider))({
        jsonrpc: '2.0',
        method: 'debug_traceTransaction',
        params: [txHash, {}],
        id: new Date().getTime(),
    });

    const ops: Op[] = trace?.result.structLogs;

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

    const result = ops.filter(op => op.gasCost > options.minOpGasCost).map(op => op.traceAddress.join('-') + '-' + op.op +
                        (options.args ? '(' + (op.args || []).join(',') + ')' : '') +
                        (options.res ? (op.res ? ':0x' + op.res : '') : '') +
                        ' = ' + op.gasCost);

    if (optionalTraceFile) {
        await fs.writeFile(optionalTraceFile, JSON.stringify(result));
    }

    return result;
}
