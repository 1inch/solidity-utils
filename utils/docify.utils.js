#!/usr/bin/env node
const BASE_DIR = 'docs';
const OUTPUT_DIR = process.env.DOCGEN_OUTPUT_DIR || `${BASE_DIR}`;

const fs = require('fs');
const path = require('path');

function getFileNameWithoutExtension (fileName) {
    return fileName.substr(0, fileName.lastIndexOf('.'));
}

function getReadmes (targetPath) {
    let result = [];
    const readmePath = path.join(targetPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
        const content = `# ${path.basename(targetPath)}\n`;
        result.push({ path: readmePath, content });
    }
    const childDirs = fs.readdirSync(targetPath, { withFileTypes: true }).filter(item => item.isDirectory());
    for (const dir of childDirs) {
        result = result.concat(getReadmes(path.join(targetPath, dir.name)));
    }
    return result;
}

function generateReadmes (readmes) {
    for (const readme of readmes) {
        fs.writeFileSync(readme.path, readme.content);
    }
}

function getSummary (targetPath) {
    function getSummaryRoot (summaryTargetPath, indentation) {
        function specialCaseRoot (item) {
            if (item.indentation >= 0) {
                return item;
            }
            return ({
                name: 'Main Readme',
                path: item.path,
                indentation: 0,
            });
        }

        const items = fs.readdirSync(summaryTargetPath, { withFileTypes: true });
        let result = [specialCaseRoot({
            name: path.basename(summaryTargetPath),
            path: path.relative(targetPath, path.join(summaryTargetPath, 'README.md')).replaceAll('\\', '/'),
            indentation: indentation - 1,
        })];
        for (const dir of items.filter(item => item.isDirectory())) {
            result = result.concat(getSummaryRoot(path.join(summaryTargetPath, dir.name), indentation + 1));
        }
        result = result
            .concat(items
                .filter(item => !item.isDirectory() &&
                    !item.name.endsWith('README.md') &&
                    !item.name.endsWith('SUMMARY.md'))
                .map(file => ({
                    name: getFileNameWithoutExtension(file.name),
                    path: path.relative(targetPath, path.join(summaryTargetPath, file.name)).replaceAll('\\', '/'),
                    indentation,
                })));
        return result;
    }

    function generateContent (summaryTree) {
        const lines = summaryTree.map(x => `${'\t'.repeat(x.indentation)}* [${x.name}](${x.path})`).join('\n');
        return `# Table of contents\n\n${lines}`;
    }

    return generateContent(getSummaryRoot(targetPath, 0));
}

function generateSummary (targetPath, summary) {
    fs.writeFileSync(path.join(targetPath, 'SUMMARY.md'), summary);
}

function generateGitbookFiles () {
    if (fs.existsSync(path.join(BASE_DIR, 'README.md'))){
        fs.copyFileSync(path.join(BASE_DIR, 'README.md'), path.join(OUTPUT_DIR, 'README.md'));
    }

    const readmesToGenerate = getReadmes(OUTPUT_DIR);
    const summary = getSummary(OUTPUT_DIR);

    generateReadmes(readmesToGenerate);
    generateSummary(OUTPUT_DIR, summary);
}

function removeUnwantedDocs () {
    const unwantedDirs = ['mocks', 'tests'];
    for (const unwantedDir of unwantedDirs) {
        fs.rmSync(path.join(OUTPUT_DIR, unwantedDir), { force: true, recursive: true });
    }
}

generateGitbookFiles();
removeUnwantedDocs();
