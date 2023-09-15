import config from '../config.json';

import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';

import { loadTokenBalances, transferTokens, loadProvider } from '../store/blockchainInteractions'

// import dapp from '../assets/dapp.svg';
import pln from '../assets/zloty3_15x15.svg';

const UserBalance = () => {

    const [token1TransferAmount, setToken1TransferAmount] = useState(0)

    const [token2TransferAmount, setToken2TransferAmount] = useState(0)

    const dispatch = useDispatch()

    //const provider = useSelector(state => state.providerReducer.connection) // how it should work if the provider object was passed through correctly like in ethers v5
    const provider = loadProvider(dispatch)

    const symbols = useSelector(state => state.tokensReducer.symbols)

    const exchange = useSelector(state => state.exchangeReducer.contracts)

    const tokens = useSelector(state => state.tokensReducer.contracts)

    const account = useSelector(state => state.providerReducer.account)

    const tokenBalances = useSelector(state => state.tokensReducer.balances)

    const exchangeBalances = useSelector(state => state.exchangeReducer.balances)

    const transferInProgress = useSelector(state => state.exchangeReducer.transferInProgress)
      
    const amountHandler = (e, token) => {
      if (token.address === tokens[0].address) {
        setToken1TransferAmount(e.target.value)
      }
      if (token.address === tokens[1].address) {
        setToken2TransferAmount(e.target.value)
      }
    }

    // Step 1: Do transfer (deposit or withdrawal)
    // Step 2: Notify app of pending transfer (using redux store)
    // Step 3: Get confirmation from blockchain
    // Step 4: Tell redux store it was successful
    // Step 5: Handle failed transfers by notifying app

    const depositHandler = (e, token) => {
      e.preventDefault() // prevents default behavior of refreshing the page
      if (token.address === tokens[0].address) {
        transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount, dispatch)
        setToken1TransferAmount(0)
      }
      if (token.address === tokens[1].address) {

      }
    }

    useEffect(() => {
        
        if(exchange && tokens[0] && tokens[1] && account) {
            loadTokenBalances(exchange, tokens, account, dispatch)
        }
    }, [exchange, tokens, account, transferInProgress])

    return (
        <div className='component exchange__transfers'>
          <div className='component__header flex-between'>
            <h2>Balance</h2>
            <div className='tabs'>
              <button className='tab tab--active'>Deposit</button>
              <button className='tab'>Withdraw</button>
            </div>
          </div>
    
          {/* Deposit/Withdraw Component 1 (DApp) */}
    
          <div className='exchange__transfers--form'>
            <div className='flex-between'>
                <p><small>Token</small><br /><img src={pln}  alt="Token Logo" />{symbols && symbols[0]}</p>
                <p><small>Wallet</small><br />{tokenBalances && (Number(tokenBalances[0] || 0)/1000000000000000000).toFixed(4)}</p>
                <p><small>Exchange</small><br />{exchangeBalances && (Number(exchangeBalances[0] || 0)/1000000000000000000).toFixed(4)}</p>
            </div>
    
            <form onSubmit={(e) => depositHandler(e, tokens[0])}>
              <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
              <input type="text" id='token0' placeholder='0.0000' value={token1TransferAmount === 0 ? '' : token1TransferAmount}onChange={(e) => amountHandler(e, tokens[0])}/>
    
              <button className='button' type='submit'>
                <span>Deposit</span>
              </button>
            </form>
          </div>
    
          <hr />
    
          {/* Deposit/Withdraw Component 2 (mETH) */}
    
          <div className='exchange__transfers--form'>
            <div className='flex-between'>
    
            </div>
    
            <form>
              <label htmlFor="token1"></label>
              <input type="text" id='token1' placeholder='0.0000'/>
    
              <button className='button' type='submit'>
                <span></span>
              </button>
            </form>
          </div>
    
          <hr />
        </div>
      );
}

export default UserBalance;