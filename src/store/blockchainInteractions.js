import { BrowserProvider, ethers } from 'ethers'



const TOKEN_ABI  = require('../abis/Token.json') // import token abi file

export const loadProvider = (dispatch) => {
    
    const provider = new ethers.BrowserProvider(window.ethereum) // puts entire metamask connection inside ethers
    // console.log(provider)
    dispatch({ type: 'PROVIDER_LOADED', connection: provider })

    return provider
}

export const loadNetwork = async (provider, dispatch) => {
    const { chainId } = await provider.getNetwork() // an example of object destructuring: in JS you can use curly braces to enter a key into the object that is being returned to get the value for the key:value pair
    // console.log(`${chainId}`)
    dispatch({ type: 'NETWORK_LOADED', chainId: chainId.toString() })

    return chainId
}

export const loadAccount = async (dispatch) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) // passing in object that makes RPC call to node (how to talk to and through metamask)
    const account = accounts[0]
    //console.log(accounts[0])
    dispatch({ type: 'ACCOUNT_LOADED', account: account })

    return account
}

export const loadToken = async (provider, address, dispatch) => {
    const { chainId } = await provider.getNetwork()

    const token = new ethers.Contract(address, TOKEN_ABI, provider) // creates a local JS instance of the smart contract from a JSON array (the ABI)
    const symbol = await token.symbol()
    // console.log(await token.getAddress())
    // console.log(await token.symbol())

    dispatch({ type: 'TOKEN_LOADED', token, symbol })

    return token
}