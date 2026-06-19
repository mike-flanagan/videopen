// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/VideoPenRegistry.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        VideoPenRegistry registry = new VideoPenRegistry(deployer);

        vm.stopBroadcast();

        (address content, address subscriptions, address vault) = registry.getAddresses();

        console.log("VideoPenRegistry:", address(registry));
        console.log("ContentRegistry:", content);
        console.log("SubscriptionManager:", subscriptions);
        console.log("SponsorshipVault:", vault);
    }
}
