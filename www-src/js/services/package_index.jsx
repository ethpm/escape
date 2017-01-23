import _ from 'lodash'
import PackageIndexAssets from '../../contracts/package_index'
import { getWeb3 } from './web3'

var DEFAULT_PACKAGE_INDEX_CONTRACT_ADDRESS = '0xa5c180ea1b8cba0ec417c32e7a3d5b556c4e0523'

export function getDefaultPackageIndexContractAddress() {
  return Promise.resolve(DEFAULT_PACKAGE_INDEX_CONTRACT_ADDRESS)
}

export function getPackageIndex(contractAddress) {
  return new Promise(function(resolve, reject) {
    if (contractAddress === null) {
      reject("Package Index contract address is 'null'")
    } else {
      getWeb3().then(function(web3) {
        resolve(web3.eth.contract(PackageIndexAssets.abi).at(contractAddress))
      }, function(error) {
        console.error(error)
      })
    }
  })
}

export function getPackageDbAddress(contractAddress) {
  return new Promise(function(resolve, reject) {
    getPackageIndex(contractAddress).then(function(packageIndex) {
      packageIndex.packageDb.call(function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
  })
}
