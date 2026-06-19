// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Pull-payment treasury for all creator earnings (subscriptions + tips).
contract SponsorshipVault is ReentrancyGuard {
    mapping(address => uint256) private _balances;

    event Deposited(address indexed creator, address indexed sender, uint256 amount);
    event Withdrawn(address indexed creator, uint256 amount);

    /// @notice Deposit ETH into a creator's balance. Called by SubscriptionManager and direct tippers.
    function deposit(address creator) external payable {
        require(msg.value > 0, "SponsorshipVault: zero value");
        _balances[creator] += msg.value;
        emit Deposited(creator, msg.sender, msg.value);
    }

    /// @notice Creator withdraws their full available balance.
    function withdraw() external nonReentrant {
        uint256 amount = _balances[msg.sender];
        require(amount > 0, "SponsorshipVault: nothing to withdraw");
        _balances[msg.sender] = 0;
        emit Withdrawn(msg.sender, amount);
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "SponsorshipVault: transfer failed");
    }

    function balanceOf(address creator) external view returns (uint256) {
        return _balances[creator];
    }
}
