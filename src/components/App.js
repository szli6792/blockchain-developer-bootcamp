import { useEffect } from 'react'
import { useDispatch } from 'react-redux' // A hook to use redux
import { loadProvider, loadNetwork, loadAccount, loadTokenPair, loadExchange, subscribeToEvents } from '../store/blockchainInteractions'

import Navbar from './Navbar'
import Markets from './Markets'
import UserBalance from './UserBalance'

const config = require('../config.json') // import config file

function App() {

  // put JS scripts here

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {

    // Connect Ethers to Blockchain via a provider (Metamask browser app)
    const provider = loadProvider(dispatch)

    // Get Metamask Account & it's Ether Balance (moved this to Navbar.js)
    //const account = await loadAccount(provider, dispatch)
    window.ethereum.on('accountsChanged', () => { // updates navbar upon account change in metamask
      loadAccount(provider, dispatch)
    })

    // Talk to the Token Smart Contract: MAKE SURE TO DEPLOY TOKENS FIRST!
    const chainId = await loadNetwork(provider, dispatch)

    // Reload page when network changes
    window.ethereum.on('chainChanged', () => { // updates navbar upon account change in metamask
      window.location.reload()
    })

    if(config[chainId].token1) {
      // Why use ABI's? Because it reduces the number of interactions (calls and returns) with the actual blockchain to the bare minimum (less $ spent)
      //const Token1 = config[chainId].token1
      //const Token2 = config[chainId].token2
      //const Token3 = config[chainId].token3
      await loadTokenPair(provider, [config[chainId].token1.address, config[chainId].token2.address], dispatch)

      // Load Exchange Contract
      const exchange = await loadExchange(provider, config[chainId].exchange.address , dispatch)

      // Listen for events
      subscribeToEvents(exchange, dispatch)
    }
  }

  // update App component by passing in functions

  useEffect(() => {
    loadBlockchainData()
  })

  // use redux as a database to manage the state on the client side (it mirrors the blockchain)

  return (
    <div>

      {/* Navbar */}

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          <Markets />

          {/* Balance */}

          <UserBalance />

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