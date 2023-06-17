// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol"; // bring in simple ERC20 Token smart contract

//----------------------------------------------------------------

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

    // Init Counter Cache
    uint256 public orderCount; // track number of orders, starts at 0

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Keep track of tokens inside exchange:
    // ERC20 contract : (trader address : balance)
    mapping(address => mapping(address => uint256)) public tokenBalance; // 0 by default

    // Keep track of orders (database style):
    // Order ID Key : DOM_Order struct instance
    mapping(uint256 => orderDetails) public order;

    // Store order details:
    struct orderDetails { // Depth Of Market Order
        uint256 id; // Order ID
        address maker; // Order maker
        uint256 timestamp; // When order was created
        address tokenGet; // Any ERC20 smart contract address
        uint256 amountGet;
        address tokenGive; // Any other ERC20 smart contract address
        uint256 amountGive;
    }

    // Keep track of cancelled orders:
    mapping(uint256 => bool) public orderCancelled;

    // Keep track of filled orders:
    mapping(uint256 => bool) public orderFilled;

    // Deposit Event
    event Deposit(
        address token,
        address user,
        uint256 amount, 
        uint256 balance
    );

    // Withdraw Event
    event Withdrawal(
        address token, 
        address user, 
        uint256 amount, 
        uint256 balance
    );

    // Order Event
    event Order(
        uint256 id,
        address maker,
        uint256 timestamp,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive
    );

    // Cancel Event
    event OrderCancelled(
        uint256 id,
        address maker,
        uint256 timestamp,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive
    );

    // Trade Event
    event Trade(
        uint256 id,
        address maker,
        uint256 timestamp,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address taker
    );
//----------------------------------------------------------------

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
        // require that the DELEGATED TRANFER is 
        // called successfully before any balance is updated
        require(Token(_token).transferFrom(msg.sender, address(this), _amount)); 
        
        // Update user balance (tokens already in exchange wallet but this is for good accounting)
        tokenBalance[_token][msg.sender] = tokenBalance[_token][msg.sender] + _amount;
        
        // Emit an event
        emit Deposit(_token, msg.sender, _amount, tokenBalance[_token][msg.sender]);
    }

//----------------------------------------------------------------

    // Check Balances (wrapper funciton that checks value of a mapping)
    // ERC20 standard recommends this additional wrapping
    function balanceOf(address _token, address _user)
    public
    view
    returns (uint256) {
        return tokenBalance[_token][_user];
    }

//----------------------------------------------------------------

    // Withdraw ERC20 Tokens
    function withdrawToken(
        address _token, // Any ERC20 smart contract address
        uint256 _amount) 
    public {
        // Ensure user has enough tokens to withdraw
        require(tokenBalance[_token][msg.sender] >= _amount);

        // Transfer tokens from exchange to user:
        // Exchange is doing this on user request!
        // (1) user interacts with exchange contract
        // (2) exchange contract calls token contract
        // Exchange level protection: 
        // require that the DIRECT TRANSFER is 
        // called successfully before any balance is updated
        require(Token(_token).transfer(msg.sender, _amount)); 
        
        // Update user balance (tokens already left but this is for good accounting)
        tokenBalance[_token][msg.sender] = tokenBalance[_token][msg.sender] - _amount;
        
        // Emit an event
        emit Withdrawal(_token, msg.sender, _amount, tokenBalance[_token][msg.sender]);
    }

//----------------------------------------------------------------

    // Make Orders
    function makeOrder(
        address _tokenGet, // Any ERC20 smart contract address
        uint256 _amountGet,
        address _tokenGive, // Any other ERC20 smart contract address
        uint256 _amountGive)
    public {
        // Require sufficient token balance
        require(tokenBalance[_tokenGive][msg.sender] >= _amountGive);

        // Increment order count
        orderCount++;

        order[orderCount] = orderDetails(
            orderCount,
            msg.sender,
            block.timestamp, // in epoch time
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive
        );

        // Emit event
        emit Order(
            order[orderCount].id,
            order[orderCount].maker,
            block.timestamp, // in epoch time
            order[orderCount].tokenGet,
            order[orderCount].amountGet,
            order[orderCount].tokenGive,
            order[orderCount].amountGive
        );
    }
//----------------------------------------------------------------
    // Cancel Orders
    function cancelOrder (
        uint256 _id
    ) public {
        // Fetch Order
        orderDetails storage _order = order[_id]; // storage keyword used because struct stored in blockchain

        // Order must exist
        require(_order.id == _id);

        // Ensure only the maker can cancel their orders
        require(address(_order.maker) == msg.sender); // casts struct component to address type

        // Store all cancelled orders in special mapping to
        // cancel the order
        orderCancelled[_id] = true;
        
        // Emit cancellation event
        emit OrderCancelled(
            _order.id,
            _order.maker,
            block.timestamp, // in epoch time
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
        );
    }

//----------------------------------------------------------------
    // Fill Orders
    function fillOrder(
        uint256 _id
     ) public {
        // Fetch Order
        orderDetails storage _order = order[_id]; // storage keyword used because struct stored in blockchain

        // Order must exist
        require(_id > 0 && _id <= orderCount, "Order does not exist");

        // Make sure order isn't cancelled
        require(!orderCancelled[_id]);

        // Make sure order isn't already filled
        require(!orderFilled[_id]);

        // Swap Token Ownership (Trade)
        trade(
            _order.maker,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
        );

        // Change order status
        orderFilled[_id] = true;

        // Emit Order Fill Event
        emit Trade(
            _order.id,
            _order.maker,
            block.timestamp, // in epoch time
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            msg.sender // the taker
        );
    }

    // Internal Trade Function
    function trade(
        address _maker,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {

        // Get taker fee amount
        uint256 _takerFeeAmount = (_amountGet * feePercent) / 100;

        // Transfer token1
        tokenBalance[_tokenGet][msg.sender] = 
            tokenBalance[_tokenGet][msg.sender] - 
            (_amountGet + _takerFeeAmount);

        tokenBalance[_tokenGet][_maker] = 
            tokenBalance[_tokenGet][_maker] + 
            _amountGet;

        // Transfer token2
        tokenBalance[_tokenGive][_maker] = 
            tokenBalance[_tokenGive][_maker] - 
            _amountGive;

        tokenBalance[_tokenGive][msg.sender] = 
            tokenBalance[_tokenGive][msg.sender] + 
            _amountGive;

        // Update exchange account
        tokenBalance[_tokenGet][feeAccount] = 
            tokenBalance[_tokenGet][feeAccount] + 
            _takerFeeAmount;
    }

//----------------------------------------------------------------
}