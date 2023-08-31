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

        default:
            return state
    }
}

export const tokens = (state = { loaded: false, contract: null, symbol: null }, action) => {
    switch (action.type) {
        case 'TOKEN_LOADED':
            return {
                ...state, // update existing state by creating a copy
                loaded: true,
                contract: action.token,
                symbol: action.symbol
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