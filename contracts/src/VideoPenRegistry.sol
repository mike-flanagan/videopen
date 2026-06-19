// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ContentRegistry.sol";
import "./SubscriptionManager.sol";
import "./SponsorshipVault.sol";

/// @notice Single entry-point contract that stores canonical addresses of all VideoPen contracts.
///         Frontend only needs this one address to discover the entire protocol.
contract VideoPenRegistry is Ownable {
    ContentRegistry public contentRegistry;
    SubscriptionManager public subscriptionManager;
    SponsorshipVault public sponsorshipVault;

    event ContractsDeployed(
        address contentRegistry,
        address subscriptionManager,
        address sponsorshipVault
    );

    constructor(address initialOwner) Ownable(initialOwner) {
        // Deploy all sub-contracts
        sponsorshipVault = new SponsorshipVault();
        subscriptionManager = new SubscriptionManager(address(sponsorshipVault));
        contentRegistry = new ContentRegistry();

        emit ContractsDeployed(
            address(contentRegistry),
            address(subscriptionManager),
            address(sponsorshipVault)
        );
    }

    /// @notice Update contract addresses when new versions are deployed.
    function updateContracts(
        address _contentRegistry,
        address _subscriptionManager,
        address _sponsorshipVault
    ) external onlyOwner {
        if (_contentRegistry != address(0)) contentRegistry = ContentRegistry(_contentRegistry);
        if (_subscriptionManager != address(0)) subscriptionManager = SubscriptionManager(_subscriptionManager);
        if (_sponsorshipVault != address(0)) sponsorshipVault = SponsorshipVault(_sponsorshipVault);
    }

    function getAddresses() external view returns (
        address _contentRegistry,
        address _subscriptionManager,
        address _sponsorshipVault
    ) {
        return (
            address(contentRegistry),
            address(subscriptionManager),
            address(sponsorshipVault)
        );
    }
}
