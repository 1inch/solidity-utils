### UTILS

#### Docify

Generates documentation in markdown format from natspec docs

##### Usage
Add to `package.json` file solidity compiler version (add version you use), solidity-docgen 0.6 util and shortcut to run command

`devDependencies` section

```
"solc": "0.8.23",
"solidity-docgen": "0.6.0-beta.36",
```

`scripts` section
```
"docify": "yarn hardhat docgen; npx solidity-utils-docify"
```

You can set output directory with ENV variable:
```
"docify": "DOCGEN_OUTPUT_DIR=./docs npx solidity-utils-docify"
```

Then set appopriate settings for docgen in `hardhat.config.js` file

```JavaScript
require('solidity-docgen');

// You can use 1inch templates built-in templates
const { oneInchTemplates } = require('@1inch/solidity-utils/docgen');

module.exports = {
...
    docgen: {
        outputDir: "docs", // Can be omitted, docs used by default
        templates: oneInchTemplates(), // 1inch templates
        pages: 'files', // Doc output format for 1inch templates
        exclude: ['mocks', 'test'], // Directories to exclude from generation
    }
}

```

#### Dependencies list (imports-list)

Lists all imports recursively for the given solidity contract file.

##### Usage
```
npx imports-list -i <solidity file> [-a <alias list>]
```

Available parameters
```
Options:
  -i, --input <input>     file to get dependencies for
  -a, --alias [alias...]  projects alias list
  -h, --help              display help for command
```
Aliases are used to provide source code for third-party projects.
For example, your contract uses imports from your other project and import is defined as
```
import "@1inch/otherproject/contracts/dependency.sol";
```
and you've got source code for `@1inch/otherproject` locally. Then you provide local path for the project to rip dependencies from `dependency.sol` as well.
If there are several dependencies they should be provided using space as separator.

##### Example
File imports
```Solidity
#rootFile.sol
import '@1inch/otherproject/contracts/dependency.sol'

#@1inch/otherproject/contracts/dependency.sol
import 'helpers/helper.sol'
```
File and folder structure
```
rootFolder/

-- mainProject/
---- contracts/
------ rootFile.sol

-- dependencyProject/
---- helpers/
------ helper.sol
---- dependency.sol
```
Command
```
rootFolder/mainProject % npx imports-list -i './contracts/rootFile.sol' -a '@1inch/otherproject' '../dependencyProject'
```
Output
```
Project => root
not set

Project => @1inch/otherproject
../otherproject/contracts/dependency.sol
../otherproject/contracts/helpers/helper.sol
```

#### Test documentation generator (test-docgen)
Script generates documentation for tests in markdown format.
Give descriptions for `describe` and `it` sections and build documentation using these descriptions.

##### Example
Test described as shown below

```JavaScript
// Test suite
describe('My feature', function() {
    // Nested test suite
    describe("My subfeature", function() {
        /*
            **Test case 1**
            Test case should work
         */
        it("My case", function() {
        // code here
        })
    })
})
```
will generated the following output
```Markdown

# My feature

Test suite

## My subfeature

Nested test suite

### My case

**Test case 1**
Test case should work
```

##### Installation
- Before use install documentation parser
```
yarn add acquit --dev
```
- Optionally configure script for default usage. Add to `script` section in `package.json`
```
"test:docs": "npx test-docgen"
```
- Optionally configure script for generating test list only. Add to `script` section in `package.json`
```
"test:docs": "npx test-docgen -l"
```

##### Usage
If script configured
```
yarn test:docs
```
or
```
npx test-docgen
```

Available parameters
```
Options:
  -i, --input <input>      tests directory (default: "test")
  -x, --exclude [exclude]  exclude directories and files. omit argument to exclude all subdirectories (default: false)
  -o, --output <output>    file to write output (default: "TESTS.md")
  -c, --code               include code (default: false)
  -l, --list               list tests only, do not include description (default: false)
  -d, --debug              debug mode (default: false)
  -h, --help               display help for command
```
##### Examples
Generate docs with default input and output
```
npx test-docgen
```

Generate docs for files in folders `tests/mocks` and `tests/utils`
```
npx test-docgen -i "tests/mocks;tests/utils"
```
Exclude from docs file `test/mock-exclude.js` and `test/utils folder`
```
npx test-docgen -x "tests/mock-exclude.js;tests/utils"
```
Generate list of tests only
```
npx test-docgen -l
```
