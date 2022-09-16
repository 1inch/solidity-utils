// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma abicoder v1;


interface IERC20MetadataUppercase {
    function NAME() external view returns (string memory);  // solhint-disable-line func-name-mixedcase
    function SYMBOL() external view returns (string memory);  // solhint-disable-line func-name-mixedcase
}
