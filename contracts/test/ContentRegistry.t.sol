// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ContentRegistry.sol";

contract ContentRegistryTest is Test {
    ContentRegistry registry;

    address creator = makeAddr("creator");
    address other = makeAddr("other");

    string constant CID = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
    string constant META = "bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq";

    function setUp() public {
        registry = new ContentRegistry();
    }

    function test_publish() public {
        vm.prank(creator);
        uint256 videoId = registry.publish(CID, META, false);

        assertEq(videoId, 1);
        (
            address _creator,
            string memory _contentCid,
            string memory _metadataCid,
            uint256 _publishedAt,
            bool _isGated,
            bool _removed
        ) = registry.videos(1);

        assertEq(_creator, creator);
        assertEq(_contentCid, CID);
        assertEq(_metadataCid, META);
        assertGt(_publishedAt, 0);
        assertFalse(_isGated);
        assertFalse(_removed);
    }

    function test_publishGated() public {
        vm.prank(creator);
        registry.publish(CID, META, true);

        (,,,,bool isGated,) = registry.videos(1);
        assertTrue(isGated);
    }

    function test_duplicateCidReverts() public {
        vm.prank(creator);
        registry.publish(CID, META, false);

        vm.prank(creator);
        vm.expectRevert("ContentRegistry: CID already published");
        registry.publish(CID, META, false);
    }

    function test_remove() public {
        vm.prank(creator);
        registry.publish(CID, META, false);

        vm.prank(creator);
        registry.remove(1);

        (,,,,,bool removed) = registry.videos(1);
        assertTrue(removed);
    }

    function test_removeByNonCreatorReverts() public {
        vm.prank(creator);
        registry.publish(CID, META, false);

        vm.prank(other);
        vm.expectRevert("ContentRegistry: not creator");
        registry.remove(1);
    }

    function test_getCreatorVideos() public {
        vm.prank(creator);
        registry.publish(CID, META, false);
        vm.prank(creator);
        registry.publish("bafybeib", "bafybeic", false);

        uint256[] memory ids = registry.getCreatorVideos(creator);
        assertEq(ids.length, 2);
        assertEq(ids[0], 1);
        assertEq(ids[1], 2);
    }

    function test_emptyBytesReverts() public {
        vm.prank(creator);
        vm.expectRevert("ContentRegistry: empty contentCid");
        registry.publish("", META, false);
    }
}
