// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;


library AddressArray {
    struct Data {
        mapping(uint256 => uint256) _raw;
    }

    function length(Data storage self) internal view returns(uint256) {
        return self._raw[0] >> 160;
    }

    function at(Data storage self, uint i) internal view returns(address) {
        return address(uint160(self._raw[i]));
    }

    function get(Data storage self) internal view returns(address[] memory arr) {
        uint256 lengthAndFirst = self._raw[0];
        uint256 len = lengthAndFirst >> 160;
        arr = new address[](len);
        if (len > 0) {
            arr[0] = address(uint160(lengthAndFirst));
            for (uint i = 1; i < len; i++) {
                arr[i] = address(uint160(self._raw[i]));
            }
        }
    }

    function push(Data storage self, address account) internal returns(uint256) {
        uint256 lengthAndFirst = self._raw[0];
        uint256 len = lengthAndFirst >> 160;
        if (len == 0) {
            self._raw[0] = (1 << 160) + uint160(account);
        }
        else {
            self._raw[0] = lengthAndFirst + (1 << 160);
            self._raw[len] = uint160(account);
        }
        return len + 1;
    }

    function pop(Data storage self) internal {
        uint256 lengthAndFirst = self._raw[0];
        uint256 len = lengthAndFirst >> 160;
        require(len > 0, "AddressArray: popping from empty");
        self._raw[len - 1] = 0;
        if (len > 1) {
            self._raw[0] = lengthAndFirst - (1 << 160);
        }
    }

    function set(Data storage self, uint256 index, address account) internal {
        uint256 len = length(self);
        require(index < len, "AddressArray: index out of range");

        if (index == 0) {
            self._raw[0] = (len << 160) | uint160(account);
        }
        else {
            self._raw[index] = uint160(account);
        }
    }
}
