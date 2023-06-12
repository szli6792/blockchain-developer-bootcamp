// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

// A SIMPLE ERC20 ORDERBOOK DEX: 
    // Deposit Tokens
    // Withdraw Tokens
    // Check Balances
    // Make Orders
    // Cancel Orders
    // Fill Orders
    // Charge Fees
    // Track Fee Account

contract Exchange {

    // Track Fee Account
    address public feeAccount;
    uint256 public feePercent; // does a fee-less DEX exist?

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
    // Deposit Tokens

    // Withdraw Tokens

    // Check Balances

    // Make Orders

    // Cancel Orders

    // Fill Orders

    // Charge Fees
}