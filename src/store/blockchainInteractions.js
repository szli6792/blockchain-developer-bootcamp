import { ethers } from 'ethers'

const EXCHANGE_ABI  = require('../abis/Exchange.json') // import exchange abi file

const TOKEN_ABI  = require('../abis/Token.json') // import token abi file

export const loadProvider = (dispatch) => {
    
    const provider = new ethers.BrowserProvider(window.ethereum) // puts entire metamask connection inside ethers
    // console.log(provider)

    dispatch({ type: 'PROVIDER_LOADED', connection: window.ethereum })

    return provider
}

export const loadNetwork = async (provider, dispatch) => {
    const { chainId } = await provider.getNetwork() // an example of object destructuring: in JS you can use curly braces to enter a key into the object that is being returned to get the value for the key:value pair
    // console.log(`${chainId}`)
    dispatch({ type: 'NETWORK_LOADED', chainId: chainId.toString() })

    return chainId
}

export const loadAccount = async (provider, dispatch) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) // passing in object that makes RPC call to node (how to talk to and through metamask)
    const account = accounts[0]
    //console.log(accounts[0])
    dispatch({ type: 'ACCOUNT_LOADED', account: account })

    // Code to convert from big int
    const replacer = (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
   
    // Send balance to reducer
    const balance = await provider.getBalance(account)
    const format_balance = JSON.stringify({ value : balance }, replacer)
    dispatch({ type: 'ACCOUNT_BALANCE_LOADED', balance: format_balance.slice(10,-2)})

    return account
}

export const loadTokenPair = async (provider, addresses, dispatch) => {
    let token, symbol

    token = new ethers.Contract(addresses[0], TOKEN_ABI, provider) // creates a local JS instance of the smart contract from a JSON array (the ABI)
    symbol = await token.symbol()
    dispatch({ type: 'TOKEN_1_LOADED', token, symbol })

    token = new ethers.Contract(addresses[1], TOKEN_ABI, provider) // creates a local JS instance of the smart contract from a JSON array (the ABI)
    symbol = await token.symbol()
    dispatch({ type: 'TOKEN_2_LOADED', token, symbol })

    return token
}

export const loadExchange = async (provider, address, dispatch) => {
    let exchange

    exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
    dispatch({ type: 'EXCHANGE_LOADED', exchange })

    return exchange
}

// LOAD USER BALANCES OF TOKENS ON USER ACCOUNT VS EXCHANGE
export const loadTokenBalances = async (exchange, tokens, account, dispatch) => {

    const exchangeContract = exchange[0]

    // Code to convert from big int
    const replacer = (key, value) =>
    typeof value === 'bigint' ? value.toString() : value

    // Load token 1 user balance
    let balance = await tokens[0].balanceOf(account)
    let format_balance = JSON.stringify({ value : balance }, replacer)
    dispatch({ type: 'TOKEN_1_BALANCE_LOADED', balance: format_balance.slice(10,-2)})

    
    // Load token 1 exchange balance
    balance = await exchangeContract.balanceOf(tokens[0], account)
    format_balance = JSON.stringify({ value : balance }, replacer)
    dispatch({ type: 'EXCHANGE_TOKEN_1_BALANCE_LOADED', balance: format_balance.slice(10,-2)})
    

    // Load token 2 user balance
    balance = await tokens[1].balanceOf(account)
    format_balance = JSON.stringify({ value : balance }, replacer)
    dispatch({ type: 'TOKEN_2_BALANCE_LOADED', balance: format_balance.slice(10,-2)})

    // Load token 2 exchange balance
    balance = await exchangeContract.balanceOf(tokens[1], account)
    format_balance = JSON.stringify({ value : balance }, replacer)
    dispatch({ type: 'EXCHANGE_TOKEN_2_BALANCE_LOADED', balance: format_balance.slice(10,-2)})

    return loadTokenBalances
}

export const subscribeToEvents = (exchange, dispatch) => {
    exchange.on('Deposit', (token, user, amount, balance, event) => {
        dispatch({ type: 'TRANSFER_SUCCESS', events : event.fragment})
    })
}

export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {

    let transaction

    dispatch({ type: 'TRANSFER_REQUEST'})

    try {

        const signer = await provider.getSigner()
        const format_amount = ethers.parseUnits(amount.toString(), 18) // Big Int conversion alternate

        // approve
        transaction = await token.connect(signer).approve(exchange[0], format_amount)
        await transaction.wait()

        // deposit
        transaction = await exchange[0].connect(signer).depositToken(token, format_amount)
        await transaction.wait()

    } catch(error) {
        dispatch({ type: 'TRANSFER_FAIL'})
    }

}