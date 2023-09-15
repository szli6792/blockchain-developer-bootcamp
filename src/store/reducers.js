export const providerReducer = (state = {}, action) => {
    switch (action.type) {
        case 'PROVIDER_LOADED':
            return {
                ...state, // update existing state by creating a copy
                connection: action.connection // add connection to the copy
            }
        case 'NETWORK_LOADED':
            return {
                ...state, // update existing state by creating a copy
                chainId: action.chainId // add chainId to the copy
            }
        case 'ACCOUNT_LOADED':
            return {
                ...state, // update existing state by creating a copy
                account: action.account // add account to the copy
            }
        case 'ACCOUNT_BALANCE_LOADED':
            return {
                ...state, // update existing state by creating a copy
                balance: action.balance // add balance to the copy
            }

        default:
            return state
    }
}

const DEFAULT_TOKENS_STATE = {
    loaded: false, 
    contracts: [], 
    symbols: [],
    balances: []
}
export const tokensReducer = (state = DEFAULT_TOKENS_STATE, action) => {
    switch (action.type) {
        case 'TOKEN_1_LOADED':
            return {
                ...state, // update existing state by creating a copy
                loaded: true,
                contracts: [action.token],
                symbols: [action.symbol]
            }
        case 'TOKEN_1_BALANCE_LOADED':
            return {
                ...state, // update existing state by creating a copy
                balances: [action.balance]
            }
        case 'TOKEN_2_LOADED':
            return {
                ...state, // update existing state by creating a copy
                loaded: true,
                contracts: [...state.contracts, action.token],
                symbols: [...state.symbols, action.symbol]
            }
        case 'TOKEN_2_BALANCE_LOADED':
            return {
                ...state, // update existing state by creating a copy
                balances: [...state.balances, action.balance]
            }
        default:
            return state
    }
}

export const exchangeReducer = (state = {loaded: false, contracts: [], balances: [], transaction: { isSuccessful: false}, events: [] }, action) => {
    switch (action.type) {
        case 'EXCHANGE_LOADED':
            return {
                ...state, // update existing state by creating a copy
                loaded: true,
                contracts: [...state.contracts, action.exchange]
            }
        case 'EXCHANGE_TOKEN_1_BALANCE_LOADED':
            return {
                ...state, // update existing state by creating a copy
                balances: [action.balance]
            }
        case 'EXCHANGE_TOKEN_2_BALANCE_LOADED':
            return {
                ...state, // update existing state by creating a copy
                balances: [...state.balances, action.balance]
            }
        case 'TRANSFER_REQUEST':
            return {
                ...state, // update existing state by creating a copy
                transaction: {
                    transactionType: 'Transfer',
                    isPending: true,
                    isSuccessful: false
                },
            transferInProgress: true
            }
        case 'TRANSFER_SUCCESS':
            return {
                ...state, // update existing state by creating a copy
                transaction: {
                    transactionType: 'Transfer',
                    isPending: false,
                    isSuccessful: true
                },
                transferInProgress: false,
                events: [ ...state.events, action.events]
            }
        case 'TRANSFER_FAIL':
            return {
                ...state, // update existing state by creating a copy
                transaction: {
                    transactionType: 'Transfer',
                    isPending: false,
                    isSuccessful: false,
                    isError: true
                },
            transferInProgress: false
            }
        default:
             return state
    }
}

function counterReducer(state = { value: 0 }, action) {
    switch (action.type) {
      case 'counter/incremented':
        return { value: state.value + 1 }
      case 'counter/decremented':
        return { value: state.value - 1 }
      default:
        return state
    }
  }