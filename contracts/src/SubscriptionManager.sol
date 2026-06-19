// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./SponsorshipVault.sol";

/// @notice Manages monthly ETH subscriptions from viewers to creators.
///         All funds flow immediately into SponsorshipVault (pull-payment pattern).
contract SubscriptionManager {
    SponsorshipVault public immutable vault;

    uint256 public constant SUBSCRIPTION_PERIOD = 30 days;

    struct SubscriptionInfo {
        uint256 expiresAt;
        uint256 totalPaid;
    }

    // creator => price per period in wei (0 = unset/free)
    mapping(address => uint256) public subscriptionPrice;
    // viewer => creator => subscription data
    mapping(address => mapping(address => SubscriptionInfo)) public subscriptions;

    event PriceSet(address indexed creator, uint256 price);
    event Subscribed(address indexed viewer, address indexed creator, uint256 expiresAt, uint256 amount);
    event Renewed(address indexed viewer, address indexed creator, uint256 newExpiresAt, uint256 amount);

    constructor(address _vault) {
        vault = SponsorshipVault(_vault);
    }

    /// @notice Creator sets their subscription price. 0 = free / open.
    function setPrice(uint256 price) external {
        subscriptionPrice[msg.sender] = price;
        emit PriceSet(msg.sender, price);
    }

    /// @notice Subscribe to a creator for one period. Must send exactly the creator's price.
    function subscribe(address creator) external payable {
        uint256 price = subscriptionPrice[creator];
        require(price > 0, "SubscriptionManager: creator has no price set");
        require(msg.value == price, "SubscriptionManager: incorrect payment");

        SubscriptionInfo storage sub = subscriptions[msg.sender][creator];
        require(sub.expiresAt <= block.timestamp, "SubscriptionManager: already subscribed, use renew()");

        sub.expiresAt = block.timestamp + SUBSCRIPTION_PERIOD;
        sub.totalPaid += msg.value;

        vault.deposit{value: msg.value}(creator);
        emit Subscribed(msg.sender, creator, sub.expiresAt, msg.value);
    }

    /// @notice Extend an active or expired subscription by one period.
    function renew(address creator) external payable {
        uint256 price = subscriptionPrice[creator];
        require(price > 0, "SubscriptionManager: creator has no price set");
        require(msg.value == price, "SubscriptionManager: incorrect payment");

        SubscriptionInfo storage sub = subscriptions[msg.sender][creator];
        uint256 base = sub.expiresAt > block.timestamp ? sub.expiresAt : block.timestamp;
        sub.expiresAt = base + SUBSCRIPTION_PERIOD;
        sub.totalPaid += msg.value;

        vault.deposit{value: msg.value}(creator);
        emit Renewed(msg.sender, creator, sub.expiresAt, msg.value);
    }

    function isSubscribed(address viewer, address creator) external view returns (bool) {
        return subscriptions[viewer][creator].expiresAt > block.timestamp;
    }

    function expiresAt(address viewer, address creator) external view returns (uint256) {
        return subscriptions[viewer][creator].expiresAt;
    }
}
