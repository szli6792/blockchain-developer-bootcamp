import { useEffect } from 'react'
import { useDispatch } from 'react-redux' // A hook to use redux
import { loadProvider, loadNetwork, loadAccount, loadToken } from '../store/blockchainInteractions'

const config = require('../config.json') // import config file

function App() {

  // put JS scripts here

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    const account = await loadAccount(dispatch)

    // Connect Ethers to Blockchain
    const provider = loadProvider(dispatch)

    // Talk to the Token Smart Contract: MAKE SURE TO DEPLOY TOKENS FIRST!
    const chainId = await loadNetwork(provider, dispatch)

    // Why use ABI's? Because it reduces the number of interactions (calls and returns) with the actual blockchain to the bare minimum (less $ spent)
    const token = await loadToken(provider, config[chainId].token1.address, dispatch)
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