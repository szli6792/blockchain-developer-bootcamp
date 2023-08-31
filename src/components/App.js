import { useEffect } from 'react'
import { useDispatch } from 'react-redux' // A hook to use redux
import { loadProvider, loadNetwork, loadAccount, loadTokens, loadExchange } from '../store/blockchainInteractions'

const config = require('../config.json') // import config file

function App() {

  // put JS scripts here

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {

    // Connect Ethers to Blockchain via a provider (Metamask browser app)
    const provider = loadProvider(dispatch)

    // Get Metamask Account & it's Ether Balance
    const account = await loadAccount(provider, dispatch)

    // Talk to the Token Smart Contract: MAKE SURE TO DEPLOY TOKENS FIRST!
    const chainId = await loadNetwork(provider, dispatch)

    // Why use ABI's? Because it reduces the number of interactions (calls and returns) with the actual blockchain to the bare minimum (less $ spent)
    const Token1 = config[chainId].token1
    const Token2 = config[chainId].token2
    const Token3 = config[chainId].token3
    await loadTokens(provider, [Token1.address, Token2.address, Token3.address], dispatch)

    // Load Exchange Contract
    await loadExchange(provider, config[chainId].exchange.address , dispatch)

  }

  // update App component by passing in functions

  useEffect(() => {
    loadBlockchainData()
  })

  // use redux as a database to manage the state on the client side (it mirrors the blockchain)

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