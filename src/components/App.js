import { useEffect } from 'react'
import { ethers } from 'ethers'
import '../App.css';

const config = require('../config.json') // import config file

const TOKEN_ABI  = require('../abis/Token.json') // import token abi file

function App() {

  // put JS scripts here

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) // passing in object that makes RPC call to node (how to talk to and through metamask)
    console.log(accounts[0])

    // Connect Ethers to Blockchain
    const provider = new ethers.BrowserProvider(window.ethereum) // puts entire metamask connection inside ethers
    const { chainId } = await provider.getNetwork() // an example of object destructuring: in JS you can use curly braces to enter a key into the object that is being returned to get the value for the key:value pair
    console.log(`${chainId}`)

    // Talk to the Token Smart Contract: MAKE SURE TO DEPLOY TOKENS FIRST!


    // Why use ABI's? Because it reduces the number of interactions (calls and returns) with the actual blockchain to the bare minimum (less $ spent)
    const token = new ethers.Contract(config[chainId].token1.address, TOKEN_ABI, provider) // creates a local JS instance of the smart contract from a JSON array (the ABI)
    console.log(await token.getAddress())
    
    console.log(await token.symbol())
  }

  // update App component by passing in functions

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;