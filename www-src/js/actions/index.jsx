import * as PaginationActions from './pagination'
import * as Web3Actions from './web3'
import * as ChainActions from './chain'
import * as ConfigActions from './config'

export default {
  ...PaginationActions,
  ...Web3Actions,
  ...ChainActions,
  ...ConfigActions,
}
