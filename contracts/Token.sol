// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token { // contains all smart contract code
    // name is invoked in hardhat using .name() function call after .getContractAt() function call
    // In ethereum, Token#name is a contract call
    //string public name = "Gielda"; // state variable read from/stored directly on the blockchain
    
    //string public symbol = "GEDA";

    //uint256 public totalSupply = 1000000 * (10**decimals); // Scientific Notation for WEI

    uint256 public decimals = 18;

    // give smart contract basic variable calls:
    string public name;
    string public symbol;
    uint256 public totalSupply;
    
    // Track Balances (allow different addresses to have different balances of this token)
    mapping(address => uint256) public balanceOf; //key-value pair 1-to-1 mapping

    event Transfer( 
        address indexed from, 
        address indexed to, 
        uint256 value); //events send notifications

    // We use a constructor because the exchange needs to have the ability to mint token pairs
    constructor(
        string memory _name, 
        string memory _symbol,
        uint256 _totalSupply)
        { // uint256 don't need memory keyword?
            name = _name;
            symbol = _symbol;
            totalSupply = _totalSupply * (10**decimals); // Scientific Notation for WEI
            balanceOf[msg.sender] = totalSupply; // Take all the tokens and assign them to deployment address
        }

    // Allow sending of tokens
    function transfer(
        address _to, 
        uint256 _value) 
    public returns (bool success) {
        // Require that sender has enough tokens to spend
        require(balanceOf[msg.sender] >= _value);
        // Require that the receiver is not the 0 address
        require(_to != address(0)); // (prevents burning via the transfer function)
        // Deduct tokens from spender
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value; // read balance of sender and subtract the outgoing value
        // Credit tokens to receiver
        balanceOf[_to] = balanceOf[_to] + _value; // read balance of receiver and add the incoming value
        // Emit event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}
