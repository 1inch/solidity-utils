import { expect } from '../../src/expect';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';

describe('CalldataParse', function () {
    const data = '0x10111213141516171819fa1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f';
    const shift = 10;

    async function deployCalldataParseMock() {
        const CalldataParseMock = await ethers.getContractFactory('CalldataParseMock');
        const mock = await CalldataParseMock.deploy();
        return { mock };
    }

    describe('shift', function () {
        it('should resolve zero shift', () => testShift(0, '0x10111213141516171819fa1b1c1d1e1f202122232425262728292a2b2c2d2e2f'));
        it('should resolve mid shift', () => testShift(shift, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233343536373839'));
        it('should resolve max shift', () => testShift(16, '0x202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f'));

        async function testShift(shift: number, expected: string) {
            const { mock } = await loadFixture(deployCalldataParseMock);
            expect(await mock.asBytesN(data, shift, 32)).to.equal(expected);
        }
    });

    describe('asBool', function () {
        it('should resolve bits from zero byte', async function () {
            // 0xfa = 11111010
            await testBool(0, true);
            await testBool(1, true);
            await testBool(2, true);
            await testBool(3, true);
            await testBool(4, true);
            await testBool(5, false);
            await testBool(6, true);
            await testBool(7, false);
        });

        it('should resolve bits from mid byte', async function () {
            // 0x2f = 00101111
            await testBool(168, false);
            await testBool(169, false);
            await testBool(170, true);
            await testBool(171, false);
            await testBool(172, true);
            await testBool(173, true);
            await testBool(174, true);
            await testBool(175, true);
        });

        it('should resolve bits from last byte', async function () {
            // 0x39 = 00111001
            await testBool(248, false);
            await testBool(249, false);
            await testBool(250, true);
            await testBool(251, true);
            await testBool(252, true);
            await testBool(253, false);
            await testBool(254, false);
            await testBool(255, true);
        });

        async function testBool(bit: number, expected: boolean) {
            const { mock } = await loadFixture(deployCalldataParseMock);
            expect(await mock.asBool(data, shift, bit)).to.equal(expected);
        }
    });

    describe('asAddress', function () {
        it('should resolve address', async function () {
            const { mock } = await loadFixture(deployCalldataParseMock);
            expect(await mock.asAddress(data, shift)).to.equal(ethers.getAddress('0xfa1b1c1d1e1f202122232425262728292a2b2c2d'));
        });
    });

    describe('asUintN', function () {
        it('should resolve uintN', async function () {
            await testUint(8,   '0x00000000000000000000000000000000000000000000000000000000000000fa');
            await testUint(16,  '0x000000000000000000000000000000000000000000000000000000000000fa1b');
            await testUint(24,  '0x0000000000000000000000000000000000000000000000000000000000fa1b1c');
            await testUint(32,  '0x00000000000000000000000000000000000000000000000000000000fa1b1c1d');
            await testUint(40,  '0x000000000000000000000000000000000000000000000000000000fa1b1c1d1e');
            await testUint(48,  '0x0000000000000000000000000000000000000000000000000000fa1b1c1d1e1f');
            await testUint(56,  '0x00000000000000000000000000000000000000000000000000fa1b1c1d1e1f20');
            await testUint(64,  '0x000000000000000000000000000000000000000000000000fa1b1c1d1e1f2021');
            await testUint(72,  '0x0000000000000000000000000000000000000000000000fa1b1c1d1e1f202122');
            await testUint(80,  '0x00000000000000000000000000000000000000000000fa1b1c1d1e1f20212223');
            await testUint(88,  '0x000000000000000000000000000000000000000000fa1b1c1d1e1f2021222324');
            await testUint(96,  '0x0000000000000000000000000000000000000000fa1b1c1d1e1f202122232425');
            await testUint(104, '0x00000000000000000000000000000000000000fa1b1c1d1e1f20212223242526');
            await testUint(112, '0x000000000000000000000000000000000000fa1b1c1d1e1f2021222324252627');
            await testUint(120, '0x0000000000000000000000000000000000fa1b1c1d1e1f202122232425262728');
            await testUint(128, '0x00000000000000000000000000000000fa1b1c1d1e1f20212223242526272829');
            await testUint(136, '0x000000000000000000000000000000fa1b1c1d1e1f202122232425262728292a');
            await testUint(144, '0x0000000000000000000000000000fa1b1c1d1e1f202122232425262728292a2b');
            await testUint(152, '0x00000000000000000000000000fa1b1c1d1e1f202122232425262728292a2b2c');
            await testUint(160, '0x000000000000000000000000fa1b1c1d1e1f202122232425262728292a2b2c2d');
            await testUint(168, '0x0000000000000000000000fa1b1c1d1e1f202122232425262728292a2b2c2d2e');
            await testUint(176, '0x00000000000000000000fa1b1c1d1e1f202122232425262728292a2b2c2d2e2f');
            await testUint(184, '0x000000000000000000fa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30');
            await testUint(192, '0x0000000000000000fa1b1c1d1e1f202122232425262728292a2b2c2d2e2f3031');
            await testUint(200, '0x00000000000000fa1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132');
            await testUint(208, '0x000000000000fa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233');
            await testUint(216, '0x0000000000fa1b1c1d1e1f202122232425262728292a2b2c2d2e2f3031323334');
            await testUint(224, '0x00000000fa1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435');
            await testUint(232, '0x000000fa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233343536');
            await testUint(240, '0x0000fa1b1c1d1e1f202122232425262728292a2b2c2d2e2f3031323334353637');
            await testUint(248, '0x00fa1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738');
            await testUint(256, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233343536373839');
        });

        async function testUint(n: number, expected: string) {
            const { mock } = await loadFixture(deployCalldataParseMock);
            expect(await mock.asUintN(data, shift, n)).to.equal(BigInt(expected));
        }
    });

    describe('asBytesN', function () {
        it('should resolve bytesN', async function () {
            await testBytes(1,  '0xfa00000000000000000000000000000000000000000000000000000000000000');
            await testBytes(2,  '0xfa1b000000000000000000000000000000000000000000000000000000000000');
            await testBytes(3,  '0xfa1b1c0000000000000000000000000000000000000000000000000000000000');
            await testBytes(4,  '0xfa1b1c1d00000000000000000000000000000000000000000000000000000000');
            await testBytes(5,  '0xfa1b1c1d1e000000000000000000000000000000000000000000000000000000');
            await testBytes(6,  '0xfa1b1c1d1e1f0000000000000000000000000000000000000000000000000000');
            await testBytes(7,  '0xfa1b1c1d1e1f2000000000000000000000000000000000000000000000000000');
            await testBytes(8,  '0xfa1b1c1d1e1f2021000000000000000000000000000000000000000000000000');
            await testBytes(9,  '0xfa1b1c1d1e1f2021220000000000000000000000000000000000000000000000');
            await testBytes(10, '0xfa1b1c1d1e1f2021222300000000000000000000000000000000000000000000');
            await testBytes(11, '0xfa1b1c1d1e1f2021222324000000000000000000000000000000000000000000');
            await testBytes(12, '0xfa1b1c1d1e1f2021222324250000000000000000000000000000000000000000');
            await testBytes(13, '0xfa1b1c1d1e1f2021222324252600000000000000000000000000000000000000');
            await testBytes(14, '0xfa1b1c1d1e1f2021222324252627000000000000000000000000000000000000');
            await testBytes(15, '0xfa1b1c1d1e1f2021222324252627280000000000000000000000000000000000');
            await testBytes(16, '0xfa1b1c1d1e1f2021222324252627282900000000000000000000000000000000');
            await testBytes(17, '0xfa1b1c1d1e1f202122232425262728292a000000000000000000000000000000');
            await testBytes(18, '0xfa1b1c1d1e1f202122232425262728292a2b0000000000000000000000000000');
            await testBytes(19, '0xfa1b1c1d1e1f202122232425262728292a2b2c00000000000000000000000000');
            await testBytes(20, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d000000000000000000000000');
            await testBytes(21, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e0000000000000000000000');
            await testBytes(22, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e2f00000000000000000000');
            await testBytes(23, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30000000000000000000');
            await testBytes(24, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30310000000000000000');
            await testBytes(25, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313200000000000000');
            await testBytes(26, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233000000000000');
            await testBytes(27, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233340000000000');
            await testBytes(28, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233343500000000');
            await testBytes(29, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233343536000000');
            await testBytes(30, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233343536370000');
            await testBytes(31, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233343536373800');
            await testBytes(32, '0xfa1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233343536373839');
        });

        async function testBytes(n: number, expected: string) {
            const { mock } = await loadFixture(deployCalldataParseMock);
            expect(await mock.asBytesN(data, shift, n)).to.equal(expected);
        }
    });
});
