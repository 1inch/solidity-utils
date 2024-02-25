# BytesStorage


BytesStorage

A library for operating on bytes storage slices.



## Functions
### wrap
```solidity
function wrap(
  bytes data
) internal returns (struct BytesStorage.Slice)
```

Wraps a bytes storage array into a `Slice`. For a detailed explanation,
     refer to https://ethereum.stackexchange.com/questions/107282/storage-and-memory-layout-of-strings/155800#155800

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`data` | bytes | The bytes storage array to wrap.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`A`| struct BytesStorage.Slice | `Slice` struct that refers to the storage location and length of `data`.

### slice
```solidity
function slice(
  struct BytesStorage.Slice data,
  uint256 offset,
  uint256 size
) internal returns (struct BytesStorage.Slice)
```

Returns a new `Slice` representing a portion of the original storage slice.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`data` | struct BytesStorage.Slice | The original `Slice` to take a portion from.  
|`offset` | uint256 | The offset in bytes from the start of the original `Slice`.  
|`size` | uint256 | The size of the new `Slice` in bytes.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`A`| struct BytesStorage.Slice | new `Slice` struct representing the specified portion of the original.

### copy
```solidity
function copy(
  struct BytesStorage.Slice piece
) internal returns (bytes ret)
```

Copies a `Slice` from storage and returns it as a new bytes array.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`piece` | struct BytesStorage.Slice | The `Slice` to copy from storage.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`ret`| bytes | The new bytes array containing the copied data.

