import _ from 'lodash'
import PackageDBAssets from '../../contracts/package_db'
import { getWeb3 } from './web3'

var contractAddress = '0xe499c6aeb304fb9aa62be285a38815209eb820a5'

export function setContractAddress(_contractAddress) {
  contractAddress = _contractAddress
  return Promise.resolve(contractAddress)
}

export function getPackageDB() {
  return new Promise(function(resolve, reject) {
    if (contractAddress === null) {
      reject("Package DB contract address is 'null'")
    } else {
      getWeb3().then(function(web3) {
        resolve(web3.eth.contract(PackageDBAssets.abi).at(contractAddress))
      }, function(error) {
        console.error(error)
      })
    }
  })
}
