// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/SubscriptionManager.sol";
import "../src/SponsorshipVault.sol";

contract SubscriptionManagerTest is Test {
    SponsorshipVault vault;
    SubscriptionManager manager;

    address creator = makeAddr("creator");
    address viewer = makeAddr("viewer");

    uint256 constant PRICE = 0.01 ether;

    function setUp() public {
        vault = new SponsorshipVault();
        manager = new SubscriptionManager(address(vault));
        vm.deal(viewer, 10 ether);

        vm.prank(creator);
        manager.setPrice(PRICE);
    }

    function test_subscribe() public {
        vm.prank(viewer);
        manager.subscribe{value: PRICE}(creator);

        assertTrue(manager.isSubscribed(viewer, creator));
        assertGt(manager.expiresAt(viewer, creator), block.timestamp);
    }

    function test_subscribeWrongAmountReverts() public {
        vm.prank(viewer);
        vm.expectRevert("SubscriptionManager: incorrect payment");
        manager.subscribe{value: PRICE - 1}(creator);
    }

    function test_subscribeNoPriceReverts() public {
        address unpricedCreator = makeAddr("unpriced");
        vm.prank(viewer);
        vm.expectRevert("SubscriptionManager: creator has no price set");
        manager.subscribe{value: PRICE}(unpricedCreator);
    }

    function test_doubleSubscribeReverts() public {
        vm.prank(viewer);
        manager.subscribe{value: PRICE}(creator);

        vm.prank(viewer);
        vm.expectRevert("SubscriptionManager: already subscribed, use renew()");
        manager.subscribe{value: PRICE}(creator);
    }

    function test_renew() public {
        vm.prank(viewer);
        manager.subscribe{value: PRICE}(creator);

        uint256 firstExpiry = manager.expiresAt(viewer, creator);

        vm.prank(viewer);
        manager.renew{value: PRICE}(creator);

        uint256 secondExpiry = manager.expiresAt(viewer, creator);
        assertEq(secondExpiry, firstExpiry + 30 days);
    }

    function test_renewAfterExpiry() public {
        vm.prank(viewer);
        manager.subscribe{value: PRICE}(creator);

        vm.warp(block.timestamp + 31 days);
        assertFalse(manager.isSubscribed(viewer, creator));

        vm.prank(viewer);
        manager.renew{value: PRICE}(creator);

        assertTrue(manager.isSubscribed(viewer, creator));
    }

    function test_fundsGoToVault() public {
        vm.prank(viewer);
        manager.subscribe{value: PRICE}(creator);
        assertEq(vault.balanceOf(creator), PRICE);
    }

    function test_notSubscribedByDefault() public view {
        assertFalse(manager.isSubscribed(viewer, creator));
    }
}
