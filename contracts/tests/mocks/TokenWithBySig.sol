// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { TokenMock } from "../../mocks/TokenMock.sol";
import { BySig } from "../../mixins/BySig.sol";

contract TokenWithBySig is TokenMock, BySig {
    error WrongToken();

    event ChargedSigner(address signer, address relayer, address token, uint256 amount);

    // solhint-disable-next-line no-empty-blocks
    constructor(string memory name, string memory symbol, string memory version) TokenMock(name, symbol) EIP712(name, version) {}

    function _msgSender() internal view override(Context, BySig) returns (address) {
        return BySig._msgSender();
    }

    function getChainId() external view returns (uint256) {
        return block.chainid;
    }

    function _chargeSigner(address signer, address relayer, address token, uint256 amount, bytes calldata /* extraData */) internal override {
        if (token != address(this)) revert WrongToken();
        _transfer(signer, relayer, amount);
        emit ChargedSigner(signer, relayer, token, amount);
    }
}
