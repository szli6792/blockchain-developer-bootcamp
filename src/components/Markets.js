import config from '../config.json';

import { useSelector, useDispatch } from 'react-redux';

import { loadTokenPair, loadProvider } from '../store/blockchainInteractions'


const Markets = () => {

    const dispatch = useDispatch()
    //const provider = useSelector(state => state.providerReducer.connection) // how it should work if the provider object was passed through correctly like in ethers v5
    const provider = loadProvider(dispatch)

    const chainId = useSelector(state => state.providerReducer.chainId)
    
    // Cheq if the tokens are deployed on the selected network
    let tokensLoaded
    try {
        tokensLoaded = config[chainId].token1
    }
    catch {
        tokensLoaded = false
    }

    const marketHandler = async (e) => {
        // Load token pair here
        await loadTokenPair(provider, (e.target.value).split(','), dispatch)
    }

    return(
      <div className='component exchange__markets'>
        <div className='component__header'>
            <h2>Select Market</h2>
        </div>

        {( tokensLoaded ) ? (
            <select name="markets" id="markets" onChange={marketHandler}>
                    <option value={`${config[chainId].token1.address},${config[chainId].token2.address}`}>ePLN / eUAH</option>
                    <option value={`${config[chainId].token1.address},${config[chainId].token3.address}`}>ePLN / fETH</option>
                    <option value={`${config[chainId].token2.address},${config[chainId].token3.address}`}>eUAH / fETH</option>
            </select>
        ) : (
            <p>Trading Pair Not Deployed to Network</p>
        )}
  
        <hr />
      </div>
    )
  }
  
  export default Markets;