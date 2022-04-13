#!/usr/bin/env node

const commander = require('commander');
const fs  = require('fs');
const path = require('path');
const program = new commander.Command();


program
    .option('-i, --input <input>', 'tests directory', 'test')
    .option('-x, --exclude [exclude]', 'exclude directories and files. omit argument to exclude all subdirectories', false)
    .option('-o, --output <output>', 'file to write output', 'TESTS.md')
    .option('-c, --code', 'include code', false)
    .option('-l, --list', 'list tests only, do not include description', false)
    .option('-d, --debug', 'debug mode', false);


program.parse(process.argv);

const options = program.opts();
const debugMode = options.debug;
const includeCode = options.code ? true : false;
const listOnly = options.list ? true : false;
const includeSubs = !(options.exclude === true);
const inputDir = options.input.split(';');
const outputFile = options.output;
const excludeDirs = (typeof options.exclude == 'boolean') ? [] : options.exclude.split(';');

if (debugMode){
    console.log('----- DEBUG MODE -----');
    console.log('options:', options);
    console.log();
    console.log('parsed options:');
    console.log(
        '  includeCode:', includeCode,
        '\n  listOnly:', listOnly,
        '\n  inputDir:', inputDir,
        '\n  outputFile:', outputFile,
        '\n  includeSubs:', includeSubs,
        '\n  excludeDirs:', excludeDirs,
        '\n  debugMode:', debugMode
    );
    console.log('\nRemaining arguments: ', program.args);
    console.log('\nFiles and directories found:');
}

let files = [];
function throughDirectory (directory, includeSubs, excludeDirs) {
    if (!fs.existsSync(directory)) {
        console.log('WARNING! Directory does not exist:', directory, '=> skipped');
        return;
    }

    fs.readdirSync(directory).forEach(file => {
        const absolute = path.join(directory, file);
        if (debugMode) console.log(absolute);
        if (!excludeDirs.includes(absolute)) {
            if (fs.statSync(absolute).isDirectory()){
                if (includeSubs) throughDirectory(absolute, includeSubs, excludeDirs);
            }
            else files.push(absolute);
        }
    });
}

inputDir.forEach(dir => {
    throughDirectory(dir, includeSubs, excludeDirs);
});

if (debugMode) console.log('\nfiles:', files);



//Script
const acquitMd = require('acquit')();
const acquitJson = require('acquit')();
require('./acquit-markdown.js')(acquitMd, { code: includeCode, it: true });

const legend = {};
let content;
let markdown = '';
let legendMd = '';

if (debugMode) console.log('\nFiles processed:');
files.forEach((file) => {
    content = fs.readFileSync(file).toString();
    legend.blocks = acquitJson.parse(content);
    legend.contents = file;
    legendMd += buildLegend(legend, 1, listOnly);
    markdown += acquitMd.parse(content).toString();
    markdown += '\n';
    if (debugMode) console.log(' ', file, '=> done');
});

content = listOnly ? legendMd : legendMd + markdown;

fs.writeFileSync(outputFile, content);
console.log('done');

function buildLegend (block, depth, listOnly) {
    // console.log(depth, block.contents);
    const url = (block.contents == null)
        ? ''
        : block.contents.toLowerCase().trim()
            .split(' ').join('-')
            .split(/,|\+|\/|:|\(|\)/).join('')
            .replace('--', '-');
    let legend = listOnly
        ? Array(depth).join('    ') + '* ' + block.contents + '\n'
        : Array(depth).join('    ') + '* [' + block.contents + '](#' + url + ')\n';
    if (block.blocks) {
        legend += block.blocks.map(function (child) {
            return buildLegend(child, depth + 1, listOnly);
        }).join('');
    }
    return legend;
}
