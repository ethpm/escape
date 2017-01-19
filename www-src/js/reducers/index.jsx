import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { reducer as formReducer } from 'redux-form'

import chain from './chain'
import config from './config'
import pagination from './pagination'
import web3 from './web3'


export default combineReducers({
  chain,
  config,
  pagination,
  web3,
  routing: routerReducer,
  form: formReducer,
})
