exports.lower = lower;
exports.isContract = isContract;
exports.getFunctionsToDisplay = getFunctionsToDisplay;
exports.findContractById = findContractById;
exports.arrayHasDescriptions = arrayHasDescriptions;
// exports

function lower (text) {
    if (typeof text === 'string') {
        return text.toLowerCase();
    }
}

function isContract(item){
    return item != undefined && item.nodeType === 'ContractDefinition';
}

function arrayHasDescriptions(items){
    if (items != undefined){
        return items.map(item => item.natspec).filter(natspec => natspec !== undefined).length > 0;
    }
    return false;
}

function getFunctionsToDisplay (baseContractIds, allContracts){
    const resultMap = [];
    if (baseContractIds.length > 0){
        primaryContractFns = getContractFunctions(baseContractIds[0], allContracts);
        primaryContractFns.map(fn => resultMap.push({id: baseContractIds[0], fnId: fn.id, selector: fn.functionSelector, name: fn.name}));

        for(let i=1; i < baseContractIds.length; i++) {
            const baseContractId = baseContractIds[i];
            const functions = getContractFunctions(baseContractId, allContracts);

            const newFn = functions.filter(fn => {
                //console.log(fn);
                //console.log(baseContractId, fn.id, fn.name, fn.functionSelector);
                const exclude = fn.kind === 'constructor' && !(fn.visibility === 'public' || fn.visibility === 'external');
                const include = resultMap.find(item => item.selector === fn.functionSelector);
                return !exclude && !include;
            });

            newFn.map(fn => resultMap.push({id: fn.scope, fnId: fn.id, selector: fn.functionSelector, name: fn.name}));
        }
    }

    resultArray = Object.values(resultMap.reduce((acc, item) => {
        if (!acc[item.id]) {
            acc[item.id] = {
                id: item.id,
                functions: []
            };
        }
        acc[item.id].functions.push({
            fnId: item.fnId,
            selector: item.selector,
            name: item.name
        });
        return acc;
    }, {}));

    //console.log(resultArray);

    return resultArray;
}

function findContractById (id, allContracts) {
    return allContracts.find(contract => contract.id === id);
}

// helpers

getContractFunctions = (id, allContracts) => {
    const contract = findContractById(id, allContracts);
    return contract ? contract.functions : [];
}