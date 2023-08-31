import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// Import Reducers
import { providerReducer, tokensReducer, exchangeReducer } from './reducers'

// Save Reducers
const reducer = combineReducers({
    providerReducer,
    tokensReducer,
    exchangeReducer
})

const initialState = {}

const middleware = [thunk]

// Final config stored here
const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)))

export default store