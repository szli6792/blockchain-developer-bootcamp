import logo from '../assets/logo.png'
import ethLOGO from '../assets/eth.svg'

import config from '../config.json';

import { useSelector, useDispatch } from 'react-redux';

import Blockies from 'react-blockies' // for rendering ENS images

import { loadAccount, loadProvider } from '../store/blockchainInteractions'

const Navbar = () => {

    const dispatch = useDispatch()
    //const provider = useSelector(state => state.providerReducer.connection) // how it should work if the provider object was passed through correctly like in ethers v5
    const provider = loadProvider(dispatch)
    const account = useSelector(state => state.providerReducer.account)
    const balance = useSelector(state => state.providerReducer.balance)
    const chainId = useSelector(state => state.providerReducer.chainId)

    const connectHandler = async () => {
        // Load account here
        await loadAccount(provider, dispatch)
    }

    const networkHandler = async (e) => {
        // Load network here
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: e.target.value }]
            })
        }
        catch {
        }
    }

    return( // HTML goes here

    <div className='exchange__header grid'>

      <div className='exchange__header--brand flex'>

        <img src={logo} className="logo" alt="LOGO"></img>
        <h1>Szymon's Token Exchange</h1>
        
      </div>

      <div className='exchange__header--networks flex'>

        <img src={ethLOGO} alt="ETH Logo" className="Eth Logo"></img>

        { chainId && (
            <select name="networks" id="networks" value={config[chainId] ? `0x${chainId.toString(16)}` : '0'} onChange={networkHandler}>
                <option value="0" disabled>Select Network</option>
                <option value="0x7A69">Localhost</option>
                <option value='0x5'>Goerli</option>
            </select>
        )}
        

      </div>

      <div className='exchange__header--account flex'>

        { balance ? 
            (<p><small>My Balance</small>{(Number(balance)/1000000000000000000).toFixed(4)} ETH</p>)
            : 
            (<p>0 ETH</p>)
        }

        { account ? 
            (<a href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : `#`} target='_blank' rel='noreferrer'>{account.slice(0,5) + ' . . . ' + account.slice(38,42)}
                <Blockies 
                seed = {account}
                size={10}
                scale={3}
                color="#2187D0"
                bgColor="F1F2F9"
                sportColor="767F92"
                className = "identicon"
                />
            </a>)
            : 
            (<button className="button" onClick={connectHandler}>CONNECT</button>)
            
        }

      </div>

    </div>

    )
}

export default Navbar;