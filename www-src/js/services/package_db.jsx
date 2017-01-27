import _ from 'lodash'
import PackageDBAssets from '../../contracts/package_db'
import { getWeb3 } from './web3'

export function getPackageDB(packageDbAddress) {
  return new Promise(function(resolve, reject) {
    getWeb3().then(function(web3) {
      resolve(web3.eth.contract(PackageDBAssets.abi).at(packageDbAddress))
    }, function(error) {
      console.error(error)
    })
  })
}
