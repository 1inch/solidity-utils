import { ether, time, constants } from '../src/prelude';
import { timeIncreaseTo, fixSignature, signMessage, trackReceivedTokenAndTx, countInstructions, deployContract, deployAndGetContract, deployContractFromBytecode, getEthPrice } from '../src/utils';
import { expect } from '../src/expect';
import hre, { deployments, ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { getBytes, hexlify, randomBytes, toUtf8Bytes, EventLog, ContractTransactionReceipt } from 'ethers';
import { TokenMock, WETH } from '../typechain-types';

describe('timeIncreaseTo', function () {
    const precision = 2;

    async function shouldIncrease(secs: number) {
        const timeBefore = await time.latest();
        await timeIncreaseTo(timeBefore + secs);
        const timeAfter = await time.latest();

        expect(timeAfter).to.be.gt(timeBefore);
        expect(timeAfter - timeBefore).to.be.lte(secs + precision);
        expect(timeAfter - timeBefore).to.be.gte(secs);
    }

    it('should be increased on 1000 sec', async function () {
        await shouldIncrease(1000);
    });

    it('should be increased on 2000 sec', async function () {
        await shouldIncrease(2000);
    });

    it('should be increased on 1000000 sec', async function () {
        await shouldIncrease(1000000);
    });

    it('should be thrown with increase time to a moment in the past', async function () {
        await expect(shouldIncrease(-1000)).to.be.rejectedWith(
            /Timestamp \d+ is lower than the previous block's timestamp \d+/,
        );
    });
});

describe('fixSignature', function () {
    it('should not be fixed geth sign', async function () {
        const signature =
            '0xb453386b73ba5608314e9b4c7890a4bd12cc24c2c7bdf5f87778960ff85c56a8520dabdbea357fc561120dd2625bd8a904f35bdb4b153cf706b6ff25bb0d898d1c';
        expect(signature).equal(fixSignature(signature));
    });

    it('should be fixed ganache sign', async function () {
        const signature =
            '0x511fafdf71306ff89a063a76b52656c18e9a7d80d19e564c90f0126f732696bb673cde46003aad0ccb6dab2ca91ae38b82170824b0725883875194b273f709b901';
        const v = parseInt(signature.slice(130, 132), 16) + 27;
        const vHex = v.toString(16);
        expect(signature.slice(0, 130) + vHex).equal(fixSignature(signature));
    });
});

describe('utils', function () {
    let signer1: SignerWithAddress;
    let signer2: SignerWithAddress;

    before(async function () {
        [signer1, signer2] = await ethers.getSigners();
    });

    describe('signMessage', function () {
        it('should be signed 0x message', async function () {
            expect(await signer1.signMessage('0x')).equal(await signMessage(signer1));
        });

        it('should be signed 32 bytes random bytes', async function () {
            const message = randomBytes(32);
            expect(await signer1.signMessage(message)).equal(await signMessage(signer1, message));
        });

        it('should be signed string -> Uint8Array -> hex string -> Uint8Array', async function () {
            const message = hexlify(toUtf8Bytes('Test message'));
            expect(await signer1.signMessage(getBytes(message))).equal(await signMessage(signer1, getBytes(message)));
        });

        it('should be signed string -> Uint8Array -> hex string', async function () {
            const message = hexlify(toUtf8Bytes('Test message'));
            expect(await signer1.signMessage(message)).equal(await signMessage(signer1, message));
        });
    });

    async function deployUSDT() {
        const TokenMock = await ethers.getContractFactory('TokenMock');
        const usdt = await TokenMock.deploy('USDT', 'USDT');
        await usdt.mint(signer1, ether('1000'));
        return { usdt };
    }

    describe('trackReceivedTokenAndTx', function () {
        it('should be tracked ERC20 Transfer', async function () {
            const { usdt } = await loadFixture(deployUSDT);

            const [received, tx] = await trackReceivedTokenAndTx(ethers.provider, usdt, signer2.address, () =>
                usdt.transfer(signer2, ether('1')),
            ) as [bigint, ContractTransactionReceipt];
            expect(received).to.be.equal(ether('1'));
            expect(tx.from).equal(signer1.address);
            expect(tx.to).equal(await usdt.getAddress());
            expect(tx.logs.length).equal(1);
            expect((<EventLog>tx.logs[0]).eventName).equal('Transfer');
            expect(tx.logs[0].data.length).equal(66);
        });

        it('should be tracked ERC20 Approve', async function () {
            const { usdt } = await loadFixture(deployUSDT);

            const [received, tx] = await trackReceivedTokenAndTx(ethers.provider, usdt, signer2.address, () =>
                usdt.approve(signer2, ether('1')),
            ) as [bigint, ContractTransactionReceipt];
            expect(received).to.be.equal('0');
            expect(tx.from).equal(signer1.address);
            expect(tx.to).equal(await usdt.getAddress());
            expect(tx.logs.length).equal(1);
            expect((<EventLog>tx.logs[0]).eventName).equal('Approval');
            expect(tx.logs[0].data.length).equal(66);
        });
    });

    describe('trackReceivedToken', function () {
        it('should be tracked ERC20 Transfer', async function () {
            const { usdt } = await loadFixture(deployUSDT);

            const [received] = await trackReceivedTokenAndTx(ethers.provider, usdt, signer2.address, () =>
                usdt.transfer(signer2, ether('1')),
            );
            expect(received).to.be.equal(ether('1'));
        });

        it('should be tracked ERC20 Approve', async function () {
            const { usdt } = await loadFixture(deployUSDT);

            const [received] = await trackReceivedTokenAndTx(ethers.provider, usdt, signer2.address, () =>
                usdt.approve(signer2, ether('1')),
            );
            expect(received).to.be.equal('0');
        });
    });

    describe('countInstructions', function () {
        it('should be counted ERC20 Transfer', async function () {
            const { usdt } = await loadFixture(deployUSDT);

            const tx = (await trackReceivedTokenAndTx(ethers.provider, usdt, signer2.address, () =>
                usdt.transfer(signer2, ether('1')),
            ))[1] as ContractTransactionReceipt;
            if (hre.__SOLIDITY_COVERAGE_RUNNING === undefined) {
                expect(await countInstructions(ethers.provider, tx.logs[0].transactionHash, ['STATICCALL', 'CALL', 'SSTORE', 'SLOAD'])).to.be.deep.equal([
                    0, 0, 2, 2,
                ]);
            }
        });

        it('should be counted ERC20 Approve', async function () {
            const { usdt } = await loadFixture(deployUSDT);

            const tx = (await trackReceivedTokenAndTx(ethers.provider, usdt, signer2.address, () =>
                usdt.approve(signer2, ether('1')),
            ))[1] as ContractTransactionReceipt;
            if (hre.__SOLIDITY_COVERAGE_RUNNING === undefined) {
                expect(await countInstructions(ethers.provider, tx.logs[0].transactionHash, ['STATICCALL', 'CALL', 'SSTORE', 'SLOAD'])).to.be.deep.equal([
                    0, 0, 1, 0,
                ]);
            }
        });
    });

    describe('deployContract', function () {
        it('should be deploy new contract instance', async function () {
            const token = <TokenMock> await deployContract('TokenMock', ['SomeToken', 'STM']);
            expect(await token.getAddress()).to.be.not.eq(constants.ZERO_ADDRESS);
            expect(await token.name()).to.be.eq('SomeToken');
        });

        it('should be using without arguments', async function () {
            const weth = <WETH> await deployContract('WETH');
            expect(await weth.getAddress()).to.be.not.eq(constants.ZERO_ADDRESS);
            expect(await weth.name()).to.be.eq('Wrapped Ether');
        });
    });

    describe('deployContractFromBytecode', function () {
        it('should deploy new contract instance', async function () {
            const contractArtifact = await hre.artifacts.readArtifact('TokenMock');
            const token = <TokenMock> await deployContractFromBytecode(contractArtifact.abi, contractArtifact.bytecode, ['SomeToken', 'STM']);
            expect(await token.getAddress()).to.be.not.eq(constants.ZERO_ADDRESS);
            expect(await token.name()).to.be.eq('SomeToken');
        });

        it('can be used without arguments', async function () {
            const contractArtifact = await hre.artifacts.readArtifact('WETH');
            const weth = <WETH> await deployContractFromBytecode(contractArtifact.abi, contractArtifact.bytecode);
            expect(await weth.getAddress()).to.be.not.eq(constants.ZERO_ADDRESS);
            expect(await weth.name()).to.be.eq('Wrapped Ether');
        });
    });

    describe('deployAndGetContract', function () {
        it('should deploy new contract instance', async function () {
            const tokenName = 'SomeToken';
            // If hardhat-deploy `deploy` function logs need to be displayed, add HARDHAT_DEPLOY_LOG = 'true' to the .env file
            const token = await deployAndGetContract({
                contractName: 'TokenMock',
                constructorArgs: [tokenName, 'STM'],
                deployments,
                deployer: signer1.address,
                skipIfAlreadyDeployed: false,
                skipVerify: true,
            });
            expect(await token.getAddress()).to.be.not.eq(constants.ZERO_ADDRESS);
            expect(await token.name()).to.be.eq(tokenName);
        }); //.timeout(200000);  If this test needs to be run on a test chain, the timeout should be increased
    });

    describe('getEthPrice', function () {
        it('should return ETH price', async function () {
            expect(await getEthPrice()).to.be.gt(0);
        });

        it('should return BNB price', async function () {
            expect(await getEthPrice('BNB')).to.be.gt(0);
        });

        it('should throw error with incorrect token symbol', async function () {
            await expect(getEthPrice('INVALID_SYMBOL')).to.be.rejectedWith('Failed to parse price from Coinbase API');
        });
    });
});
