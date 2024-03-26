# BytesMemory


BytesMemory

A library for operating on bytes memory slices without copying.



## Functions
### wrap
```solidity
function wrap(
  bytes data
) internal returns (struct BytesMemory.Slice ret)
```

Creates a `Slice` from a bytes array.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`data` | bytes | The bytes array to create a slice from.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`ret`| struct BytesMemory.Slice | A `Slice` struct representing the entire bytes array.

### slice
```solidity
function slice(
  struct BytesMemory.Slice data,
  uint256 offset,
  uint256 size
) internal returns (struct BytesMemory.Slice ret)
```

Returns a new `Slice` representing a portion of the original.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`data` | struct BytesMemory.Slice | The original `Slice` to take a portion from.  
|`offset` | uint256 | The offset in bytes from the start of the original `Slice`.  
|`size` | uint256 | The size of the new `Slice` in bytes.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`ret`| struct BytesMemory.Slice | A new `Slice` struct representing the specified portion of the original.

### unwrap
```solidity
function unwrap(
  struct BytesMemory.Slice piece
) internal returns (bytes ret)
```

Converts a `Slice` back into a bytes array. The bytes array is returned without copying the data.

#### Parameters:
| Name | Type | Description                                                          |
| :--- | :--- | :------------------------------------------------------------------- |
|`piece` | struct BytesMemory.Slice | The `Slice` to convert back to a bytes array.  

#### Return Values:
| Name                           | Type          | Description                                                                  |
| :----------------------------- | :------------ | :--------------------------------------------------------------------------- |
|`ret`| bytes | The bytes array represented by the `Slice`.

