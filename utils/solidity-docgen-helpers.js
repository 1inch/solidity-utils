module.exports = {
    removeNewlines (str) {
        return str.replace(/\r?\n/g, ' ');
    },
    withoutFirstElement (arr) {
        return arr.splice(1);
    },
    getRelativeDocPath (contractName, contractsDir, sources) {
        function getRelativePath (contractPath) {
            if (contractPath.startsWith(contractsDir)) {
                return contractPath.substr(contractsDir.length + 1).replace('.sol', '.md');
            }
            if (contractPath.startsWith('@openzeppelin')) {
                const regexMatch = contractPath.match(/@openzeppelin\/contracts\/(.+)\/([^/]+)\.sol/);
                return `https://docs.openzeppelin.com/contracts/3.x/api/${regexMatch[1]}#${regexMatch[2]}`;
            }
            return null;
        }

        const sourcesKeys = Object.keys(sources);
        const contractPath = sourcesKeys.find(x => x.includes(contractName));
        return getRelativePath(contractPath);
    },
};
