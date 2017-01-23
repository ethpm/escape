import * as PaginationActions from './pagination'
import * as Web3Actions from './web3'
import * as ChainActions from './chain'
import * as ConfigActions from './config'
import * as PackageIndexActions from './package_index'

export default {
  ...PaginationActions,
  ...Web3Actions,
  ...ChainActions,
  ...ConfigActions,
  ...PackageIndexActions,
}
