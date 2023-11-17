<div align="center">
    <img src="https://github.com/1inch/solidity-utils/blob/master/.github/1inch_github_w.svg#gh-light-mode-only">
    <img src="https://github.com/1inch/solidity-utils/blob/master/.github/1inch_github_b.svg#gh-dark-mode-only">
</div>

# Utils library for contracts and tests

[![Build Status](https://github.com/1inch/solidity-utils/workflows/CI/badge.svg)](https://github.com/1inch/solidity-utils/actions)
[![Coverage Status](https://codecov.io/gh/1inch/solidity-utils/branch/master/graph/badge.svg?token=HJWBIVXQQA)](https://codecov.io/gh/1inch/solidity-utils)
[![NPM Package](https://img.shields.io/npm/v/@1inch/solidity-utils.svg)](https://www.npmjs.org/package/@1inch/solidity-utils)

### About

This repository contains frequently used smart contracts, libraries and interfaces. Also it contains utils which are used in tests.

### Solidity

|directory|.sol|description|
|--|--|--|
|contracts|`EthReceiver`||
|contracts|`Permitable`||
|contracts|`GasChecker`||
|contracts/interfaces|`IDaiLikePermit`|Interface of token which has `permit` method like DAI token|
|contracts/interfaces|`IWETH`|WETH token interface|
|contracts/libraries|`AddressArray`|library for work with array of addresses|
|contracts/libraries|`AddressSet`|library for work with set of addresses|
|contracts/libraries|`RevertReasonParser`|library parse the message from reverted method to readble format|
|contracts/libraries|`StringUtil`|optimized methods to convert data to hex|
|contracts/libraries|`UniERC20`||

### JS

|module|function|descrption|
|--|--|--|
|asserts|`assertThrowsAsync(action, msg)`|checks the async function `action()` thrown with message `msg`|
|asserts|`assertRoughlyEqualValues(expected, actual, relativeDiff)`|checks the `expected` value is equal to `actual` value with `relativeDiff` precision|
|utils|`timeIncreaseTo(seconds)`|increases blockchain time to `seconds` sec|
|utils|`trackReceivedToken(token, wallet, txPromise, ...args)`|returns amount of `token` which recieved the `wallet` in async method `txPromise` with arguments `args`|
|utils|`trackReceivedTokenAndTx(token, wallet, txPromise, ...args)`|returns transaction info and amount of `token` which recieved the `wallet` in async method `txPromise` with arguments `args`|
|utils|`fixSignature(signature)`|patchs ganache's signature to geth's version|
|utils|`signMessage(signer, messageHex) `|signs `messageHex` with `signer` and patchs ganache's signature to geth's version|
|utils|`countInstructions(txHash, instruction)`|counts amount of `instruction` in transaction with `txHash` hash|
|utils|`deployAndGetContract(contractName, constructorArgs, deployments, deployer, deploymentName, skipVerify, skipIfAlreadyDeployed, gasPrice, maxPriorityFeePerGas, maxFeePerGas, log, waitConfirmations)`|deploys contract `contractName` as `deploymentName` if not `skipIfAlreadyDeployed` with `constructorArgs` from `deployer` using `hardhat-deploy` `deployments` with additional gas options `gasPrice`, `maxPriorityFeePerGas` and `maxFeePerGas` and outputs results to the console if `log`. Tries to verify it after `waitConfirmations` on Etherscan if not `skipVerify`.|
|profileEVM|`profileEVM(txHash, instruction, optionalTraceFile)`|the same as the `countInstructions()` with option of writing all trace to `optionalTraceFile`|
|profileEVM|`gasspectEVM(txHash, options, optionalTraceFile)`|returns all used operations in `txHash` transaction with `options` and their costs with option of writing all trace to `optionalTraceFile`|

### UTILS

#### Docify

Generates documentation in markdown format from natspec docs

##### Usage
Add to `package.json` file solidity compiler version and shortcut to run command

`devDependencies` section

```
"solc": "0.8.12",
```

`scripts` section
```
"docify": "npx solidity-utils-docify"
```

...

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
