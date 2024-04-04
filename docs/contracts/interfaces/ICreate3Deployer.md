
## ICreate3Deployer

_Interface for deploying contracts with deterministic addresses via CREATE3._

### Functions list
- [deploy(salt, code) external](#deploy)
- [addressOf(salt) external](#addressof)

### Functions
### deploy

```solidity
function deploy(bytes32 salt, bytes code) external returns (address)
```
Deploys a contract using CREATE3 with a given salt and bytecode.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| salt | bytes32 | Unique value to create deterministic address. |
| code | bytes | Contract bytecode to deploy. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | address | Address of the deployed contract. |

### addressOf

```solidity
function addressOf(bytes32 salt) external view returns (address)
```
Computes the address of a contract deployed with the given salt.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| salt | bytes32 | Unique value used during deployment. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
[0] | address | Address of the contract. |

