import React from 'react'
import { compose, createStore, applyMiddleware } from 'redux'
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router'
import { Provider, connect } from 'react-redux'
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux'
import thunk from 'redux-thunk'
import persistState, {mergePersistedState} from 'redux-localstorage';
import adapter from 'redux-localstorage/lib/adapters/localStorage';
import filter from 'redux-localstorage-filter';
import debounce from 'redux-localstorage-debounce';

import rootReducer from '../reducers/index'
import actions from '../actions/index'
import actionLogger from '../middlewares/logging'

import MainLayout from './layout/MainLayout'
import ConfigureLayout from './layout/ConfigureLayout'

import ConfigureIndex from './pages/ConfigureIndex'
import ConfigureWeb3 from './pages/ConfigureWeb3'
import SiteIndex from './pages/SiteIndex'

const reducer = compose(
  mergePersistedState()
)(rootReducer)

const storage = compose(
  debounce(100, 1000),
  filter([
    'web3.config',
    'web3.selectedWeb3',
  ]),
)(adapter(window.localStorage));

const enhancer = compose(
  applyMiddleware(thunk, routerMiddleware(browserHistory, actionLogger)),
  persistState(storage),
);

function createReduxStore() {
  return createStore(
    reducer,
    enhancer,
  )
}

const store = createReduxStore()
const history = syncHistoryWithStore(browserHistory, store)

export default React.createClass({
  componentWillMount() {
    console.log('HERE')
    store.dispatch(actions.initializeWeb3())
    store.dispatch(actions.updateWeb3BrowserAvailability())
  },
  render() {
    return (
      <Provider store={store}>
        <Router history={history}>
          <Route path='/' component={MainLayout}>
            <IndexRoute component={SiteIndex} />
            <Route path="configure" component={ConfigureLayout}>
              <IndexRoute component={ConfigureIndex} />
              <Route path="web3" component={ConfigureWeb3} />
            </Route>
          </Route>
        </Router>
      </Provider>
    )
  }
})
