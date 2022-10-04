#!/usr/bin/env node

const fs  = require('fs');
const path = require('path');
const commander = require('commander');
const program = new commander.Command();

program
    .name("imports-list")
    .usage("-i <root file> [options]")
    .requiredOption("-i, --input <input>", "file to get dependencies for")
    .option("-a, --alias [alias...]", "alias list")


program.parse(process.argv);

const options = program.opts();
// process input parameter
const rootPath = options.input;
// process alias parameter
const aliases = {};
const alias_opt = options.alias;
if (alias_opt !=  undefined && alias_opt.length > 0){
    if (alias_opt.length % 2 == 0){
        for(let i=0; i<alias_opt.length; i+=2){
            aliases[alias_opt[i]] = alias_opt[i+1];
        }
    }
    else{
        let warning_notice = "\nWARNING:Skipping alias parameter, there are odd number of arguments.";
        warning_notice += "\nAliases should be set in the form of pairs seperated by space.";
        warning_notice += "\nUsage: -a alias1 path1 alias2 path2";
        console.warn(warning_notice);
    }
}

// Script body
const regexp = /^import ({.+} from )?"(?<source>.+)";/gm;

const rootString = path.relative(process.cwd(), rootPath);

let rootNode = new Node(null, new NodeItem('root', rootPath, path.resolve(rootPath)));
let rootImports = extractImports(rootNode);
rootImports = flattenResults(rootImports);

// Scripts

function Node(parentItem, nodeItem){
    this.parent = parentItem;
    this.import = nodeItem;
}

function NodeItem(name, source, path){
    this.name = name;       // @1inch/solidity-utils/contracts/EthReceiver.sol
    this.source = source;   // ./contracts/EthReceiver.sol
    this.path = path;       // /usrs/james/Desktop/1inch/solidity-utils/contracts/EthReceiver.sol
}

function extractFileImports(file){
    let imports = [];

    if (file == null)
        return imports;

    let content = fs.readFileSync(file);
    let result = content.toString().matchAll(regexp);

    for (const match of result) {
        let source = match.groups['source'];
        if (source != null){
            imports.push(source);
        }
        else{
            console.log('No source found for import: ', match);
        }
    }

    return imports;
}

function getAliasNameIfExists(source){
    for(let alias in aliases){
        if(source.startsWith(alias)){
            return alias;
        }
    }

    return false;
}

function getAliasIfExists(source){
    for(let alias in aliases){
        if(source.startsWith(alias)){
            source = source.replace(alias, aliases[alias]);
            return source;
        }
    }

    return false;
}

function isAlias(dependencyLink){
    return dependencyLink.startsWith('@');
}

function resolveProject(parentProject, dependencyLink){
    if (isAlias(dependencyLink)) {
        let alias = getAliasNameIfExists(dependencyLink);
        if (alias){
            return alias;
        }
        else{
            return null;
        }
    }
    else{
        return parentProject;
    }
}

function resolvePath(parentNode, dependencyLink){
    if (isAlias(dependencyLink)) {
        let alias = getAliasIfExists(dependencyLink)
        if( alias ){
            return path.join(process.cwd(), alias);
        }
        else{
            return null;
        }
    }
    let source_dir = path.dirname(parentNode.path);
    return path.join(source_dir, dependencyLink);
}

function resolveLinks(parentNode, dependencyLinks, nodes = []){
    for (let dependencyLink of dependencyLinks){
        let project = resolveProject(parentNode.name, dependencyLink);
        let dependencyPath = resolvePath(parentNode, dependencyLink);
        let node = new Node(parentNode, new NodeItem(project, dependencyLink, dependencyPath));
        nodes.push(node);
    }

    return nodes;
}

function extractImports(node, dependencies = []){
    let dependencyLinks = extractFileImports(node.import.path);
    let nodesToImport = resolveLinks(node.import, dependencyLinks);
    for (let nodeToImport of nodesToImport){
        let found = dependencies.find(item => item.import.path == nodeToImport.import.path);

        if (!found){
            dependencies.push(nodeToImport);
            extractImports(nodeToImport, dependencies);
        }
    }
    return dependencies;
}

function aliasCompare( a, b ) {
    if ( a.import.name < b.import.name ){
        return 1;
    }
    if ( a.import.name > b.import.name ){
        return -1;
    }
    if( a.import.path < b.import.path ){
        return -1;
    }
    if (a.import.path > b.import.path ){
        return 1;
    }
    if ( a.import.source < b.import.source ){
        return -1;
    }
    if ( a.import.source > b.import.source ){
        return 1;
    }
    return 0;
}

function flattenResults(dependencyNodes){
    dependencyNodes.sort(aliasCompare);

    let prevProject = null;
    for(let dependencyNode of dependencyNodes){
        if (dependencyNode.import.name != prevProject){
            console.log('\nProject =>', dependencyNode.import.name);
            prevProject = dependencyNode.import.name;
        }

        let relativePath = 'not set';
        if (dependencyNode.import.path != null){
            relativePath = path.relative(process.cwd(), dependencyNode.import.path);
        }
        else{
            relativePath = dependencyNode.import.source;
        }


        console.log(relativePath);
    }
}
