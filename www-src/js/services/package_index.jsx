import _ from 'lodash'
import PackageIndexAssets from '../../contracts/package_index'
import { getWeb3 } from './web3'

var DEFAULT_PACKAGE_INDEX_CONTRACT_ADDRESS = '0xa5c180ea1b8cba0ec417c32e7a3d5b556c4e0523'

export function getDefaultPackageIndexContractAddress() {
  return Promise.resolve(DEFAULT_PACKAGE_INDEX_CONTRACT_ADDRESS)
}

export function getPackageIndex(packageIndexAddress) {
  return new Promise(function(resolve, reject) {
    if (packageIndexAddress === null) {
      reject("Package Index contract address is 'null'")
    } else {
      getWeb3().then(function(web3) {
        resolve(web3.eth.contract(PackageIndexAssets.abi).at(packageIndexAddress))
      }, function(error) {
        console.error(error)
      })
    }
  })
}

export function getPackageDbAddress(packageIndexAddress) {
  return new Promise(function(resolve, reject) {
    getPackageIndex(packageIndexAddress).then(function(packageIndex) {
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

export function getReleaseDbAddress(packageIndexAddress) {
  return new Promise(function(resolve, reject) {
    getPackageIndex(packageIndexAddress).then(function(packageIndex) {
      packageIndex.releaseDb.call(function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
  })
}

export function getNumPackages(packageIndexAddress) {
  return new Promise(function(resolve, reject) {
    getPackageIndex(packageIndexAddress).then(function(packageIndex) {
      packageIndex.getNumPackages.call(function(err, result) {
        if (!err) {
          resolve(result.toNumber())
        } else {
          reject(err)
        }
      })
    })
  })
}

export function getNumReleases(packageIndexAddress) {
  return new Promise(function(resolve, reject) {
    getPackageIndex(packageIndexAddress).then(function(packageIndex) {
      packageIndex.getNumReleases.call(function(err, result) {
        if (!err) {
          resolve(result.toNumber())
        } else {
          reject(err)
        }
      })
    })
  })
}


export function getPackageName(packageIndexAddress, nameIdx) {
  return new Promise(function(resolve, reject) {
    getPackageIndex(packageIndexAddress).then(function(packageIndex) {
      packageIndex.getPackageName.call(nameIdx, function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
  })
}
