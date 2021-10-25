<p align="center">
  <img src="https://app.1inch.io/assets/images/logo.svg" width="200" alt="1inch network" />
</p>

# Utils library for contracts and tests

[![Build Status](https://github.com/1inch/solidity-utils/workflows/CI/badge.svg)](https://github.com/1inch/solidity-utils/actions)
[![Coverage Status](https://coveralls.io/repos/github/1inch/solidity-utils/badge.svg?branch=master)](https://coveralls.io/github/1inch/solidity-utils?branch=master)
[![NPM Package](https://img.shields.io/npm/v/@1inch/1inch-solidity-utils.svg)](https://www.npmjs.org/package/@1inch/1inch-solidity-utils)

### About

This repository contains frequently used smart contracts, libraries and interfaces. Also it contains utils which are used in tests.

### Solidity

|directory|.sol|description|
|--|--|--|
|contracts|`EthReceiver`||
|contracts|`Permitable`||
|contracts/interfaces|`IDaiLikePermit`||
|contracts/interfaces|`IWETH`|WETH token interface|
|contracts/libraries|`ECDSA`||
|contracts/libraries|`RevertReasonParser`||
|contracts/libraries|`UniERC20`||
|contracts/mocks|`TokenMock`|Mocked ERC20 token|

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
|profileEVM|`profileEVM(txHash, instruction, optionalTraceFile)`|the same as the `countInstructions()` with option of writing all trace to `optionalTraceFile`|
|profileEVM|`gasspectEVM(txHash, optionalTraceFile)`|returns all used operations in `txHash` transaction and their costs with option of writing all trace to `optionalTraceFile`|

