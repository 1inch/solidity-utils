const { promisify } = require('util');
const fs = require('fs').promises;

function _normalizeOp (op) {
    if (op.op === 'STATICCALL') {
        if (op.stack.length > 8 && op.stack[op.stack.length - 8] === '0000000000000000000000000000000000000000000000000000000000000001') {
            op.gasCost = 700 + 3000;
            op.op = 'STATICCALL-ECRECOVER';
        } else if (op.stack.length > 8 && op.stack[op.stack.length - 8] <= '00000000000000000000000000000000000000000000000000000000000000FF') {
            op.gasCost = 700;
            op.op = 'STATICCALL-' + op.stack[op.stack.length - 8].substr(62, 2);
        } else {
            op.gasCost = 700;
        }
    }
    if (['CALL', 'DELEGATECALL', 'CALLCODE'].indexOf(op.op) !== -1) {
        op.gasCost = 700;
    }
    if (['RETURN', 'REVERT', 'INVALID'].indexOf(op.op) !== -1) {
        op.gasCost = 3;
    }
}

async function profileEVM (txHash, instruction, optionalTraceFile) {
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

    if (Array.isArray(instruction)) {
        return instruction.map(instr => {
            return str.split('"' + instr.toUpperCase() + '"').length - 1;
        });
    }

    return str.split('"' + instruction.toUpperCase() + '"').length - 1;
}

async function gasspectEVM (txHash, optionalTraceFile) {
    const trace = await promisify(web3.currentProvider.send.bind(web3.currentProvider))({
        jsonrpc: '2.0',
        method: 'debug_traceTransaction',
        params: [txHash, {}],
        id: new Date().getTime(),
    });

    const ops = trace.result.structLogs;

    const traceAddress = [0, -1];
    for (const op of ops) {
        op.traceAddress = traceAddress.slice(0, traceAddress.length - 1);
        _normalizeOp(op);

        if (op.depth + 2 > traceAddress.length) {
            traceAddress[traceAddress.length - 1] += 1;
            traceAddress.push(-1);
        }

        if (op.depth + 2 < traceAddress.length) {
            traceAddress.pop();
        }
    }

    const result = ops.filter(op => op.gasCost > 300).map(op => op.traceAddress.join('-') + '-' + op.op + ' = ' + op.gasCost);

    if (optionalTraceFile) {
        await fs.writeFile(optionalTraceFile, JSON.stringify(result));
    }

    return result;
}

module.exports = {
    profileEVM,
    gasspectEVM,
};
