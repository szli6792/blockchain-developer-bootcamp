// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol"; // bring in simple ERC20 Token smart contract

// A SIMPLE ERC20 ORDERBOOK DEX: 
    // Track Fee Account
    // Deposit Tokens
    // Check Balances
    // Withdraw Tokens
    
    // Make Orders
    // Cancel Orders
    // Fill Orders
    // Charge Fees
    

contract Exchange {

    // Track Fee Account
    address public feeAccount;
    uint256 public feePercent; // does a fee-less DEX exist?

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Keep track of tokens inside exchange:
    // ERC20 contract : (trader address : balance)
    mapping(address => mapping(address => uint256)) public tokenBalance; // 0 by default

    // Deposit Event
    event Deposit(address token, address user, uint256 amount, uint256 balance);

    // Deposit ERC20 Tokens
    function depositToken(
        address _token, // Any ERC20 smart contract address
        uint256 _amount) 
    public {

        // Transfer tokens to exchange:
        // Exchange is doing this on user request!
        // (1) user interacts with exchange contract
        // (2) exchange contract calls token contract
        // Exchange level protection: 
        // require that the delegated transfer is 
        // called successfully before any balance is updated
        require(Token(_token).transferFrom(msg.sender, address(this), _amount)); 
        
        // Update user balance
        tokenBalance[_token][msg.sender] = tokenBalance[_token][msg.sender] + _amount;
        
        // Emit an event
        emit Deposit(_token, msg.sender, _amount, tokenBalance[_token][msg.sender]);
    }

    // Check Balances (wrapper funciton that checks value of a mapping)
    // ERC20 standard recommends this additional wrapping
    function balanceOf(address _token, address _user)
    public
    view
    returns (uint256) {
        return tokenBalance[_token][_user];
    }

    // Withdraw ERC20 Tokens

    // Make Orders

    // Cancel Orders

    // Fill Orders

    // Charge Fees
}