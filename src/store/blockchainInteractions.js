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

export const loadTokens = async (provider, addresses, dispatch) => {
    let token, symbol

    token = new ethers.Contract(addresses[0], TOKEN_ABI, provider) // creates a local JS instance of the smart contract from a JSON array (the ABI)
    symbol = await token.symbol()
    dispatch({ type: 'TOKEN_1_LOADED', token, symbol })

    token = new ethers.Contract(addresses[1], TOKEN_ABI, provider) // creates a local JS instance of the smart contract from a JSON array (the ABI)
    symbol = await token.symbol()
    dispatch({ type: 'TOKEN_2_LOADED', token, symbol })

    token = new ethers.Contract(addresses[2], TOKEN_ABI, provider) // creates a local JS instance of the smart contract from a JSON array (the ABI)
    symbol = await token.symbol()
    dispatch({ type: 'TOKEN_3_LOADED', token, symbol })

    return token
}

export const loadExchange = async (provider, address, dispatch) => {
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
    dispatch({ type: 'EXCHANGE_LOADED', exchange })

    return exchange
}