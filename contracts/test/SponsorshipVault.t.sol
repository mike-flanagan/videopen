// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/SponsorshipVault.sol";

contract SponsorshipVaultTest is Test {
    SponsorshipVault vault;

    address creator = makeAddr("creator");
    address tipper = makeAddr("tipper");

    function setUp() public {
        vault = new SponsorshipVault();
        vm.deal(tipper, 10 ether);
    }

    function test_deposit() public {
        vm.prank(tipper);
        vault.deposit{value: 1 ether}(creator);
        assertEq(vault.balanceOf(creator), 1 ether);
    }

    function test_depositZeroReverts() public {
        vm.prank(tipper);
        vm.expectRevert("SponsorshipVault: zero value");
        vault.deposit{value: 0}(creator);
    }

    function test_withdraw() public {
        vm.prank(tipper);
        vault.deposit{value: 2 ether}(creator);

        uint256 before = creator.balance;
        vm.prank(creator);
        vault.withdraw();

        assertEq(creator.balance, before + 2 ether);
        assertEq(vault.balanceOf(creator), 0);
    }

    function test_withdrawNothingReverts() public {
        vm.prank(creator);
        vm.expectRevert("SponsorshipVault: nothing to withdraw");
        vault.withdraw();
    }

    function test_multipleDeposits() public {
        vm.prank(tipper);
        vault.deposit{value: 1 ether}(creator);
        vm.prank(tipper);
        vault.deposit{value: 0.5 ether}(creator);
        assertEq(vault.balanceOf(creator), 1.5 ether);
    }

    function testFuzz_depositWithdraw(uint96 amount) public {
        vm.assume(amount > 0);
        vm.deal(tipper, amount);
        vm.prank(tipper);
        vault.deposit{value: amount}(creator);

        uint256 before = creator.balance;
        vm.prank(creator);
        vault.withdraw();

        assertEq(creator.balance, before + amount);
    }
}
