// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice On-chain index of published videos. Stores only CID references — not the content itself.
contract ContentRegistry {
    struct VideoEntry {
        address creator;
        string contentCid;   // IPFS CID of the video file
        string metadataCid;  // IPFS CID of JSON metadata (title, description, thumbnailCid, playbackId)
        uint256 publishedAt;
        bool isGated;        // true = subscribers only
        bool removed;
    }

    // Auto-incrementing video ID
    uint256 public videoCount;

    mapping(uint256 => VideoEntry) public videos;
    mapping(address => uint256[]) private _creatorVideos;

    // Track which CIDs have been published to prevent duplicates
    mapping(string => bool) public cidPublished;

    event VideoPublished(
        uint256 indexed videoId,
        address indexed creator,
        string contentCid,
        string metadataCid,
        bool isGated,
        uint256 publishedAt
    );
    event VideoRemoved(uint256 indexed videoId, address indexed creator);

    function publish(
        string calldata contentCid,
        string calldata metadataCid,
        bool isGated
    ) external returns (uint256 videoId) {
        require(bytes(contentCid).length > 0, "ContentRegistry: empty contentCid");
        require(bytes(metadataCid).length > 0, "ContentRegistry: empty metadataCid");
        require(!cidPublished[contentCid], "ContentRegistry: CID already published");

        videoId = ++videoCount;
        cidPublished[contentCid] = true;

        videos[videoId] = VideoEntry({
            creator: msg.sender,
            contentCid: contentCid,
            metadataCid: metadataCid,
            publishedAt: block.timestamp,
            isGated: isGated,
            removed: false
        });
        _creatorVideos[msg.sender].push(videoId);

        emit VideoPublished(videoId, msg.sender, contentCid, metadataCid, isGated, block.timestamp);
    }

    /// @notice Soft-delete a video. Only the creator can remove their own video.
    function remove(uint256 videoId) external {
        VideoEntry storage v = videos[videoId];
        require(v.creator == msg.sender, "ContentRegistry: not creator");
        require(!v.removed, "ContentRegistry: already removed");
        v.removed = true;
        emit VideoRemoved(videoId, msg.sender);
    }

    function getCreatorVideos(address creator) external view returns (uint256[] memory) {
        return _creatorVideos[creator];
    }

    function getCreatorVideoCount(address creator) external view returns (uint256) {
        return _creatorVideos[creator].length;
    }
}
