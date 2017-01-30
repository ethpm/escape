import _ from 'lodash'
import PackageIndexAssets from '../../contracts/package_index'
import { getWeb3 } from './web3'


export function getPackageIndex(packageIndexAddress) {
  return new Promise(function(resolve, reject) {
    getWeb3().then(function(web3) {
      resolve(web3.eth.contract(PackageIndexAssets.abi).at(packageIndexAddress))
    }, function(error) {
      console.error(error)
    })
  })
}

export function getPackageDbAddress(packageIndexAddress) {
  return new Promise(function(resolve, reject) {
    getPackageIndex(packageIndexAddress).then(function(packageIndex) {
      packageIndex.getPackageDb.call(function(err, result) {
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
      packageIndex.getReleaseDb.call(function(err, result) {
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

export function getTotalNumReleases(packageIndexAddress) {
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


export function getPackageName(packageIndexAddress, packageIdx) {
  return new Promise(function(resolve, reject) {
    getPackageIndex(packageIndexAddress).then(function(packageIndex) {
      packageIndex.getPackageName.call(packageIdx, function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
  })
}

export function getPackageData(packageIndexAddress, packageName) {
  return new Promise(function(resolve, reject) {
    getPackageIndex(packageIndexAddress).then(function(packageIndex) {
      packageIndex.getPackageData.call(packageName, function(err, result) {
        if (!err) {
          resolve({
            owner: result[0],
            createdAt: new Date(result[1].toNumber()),
            numReleases: result[2].toNumber(),
            updatedAt: new Date(result[3].toNumber()),
          })
        } else {
          reject(err)
        }
      })
    })
  })
}

export function getAllPackageReleaseHashes(packageIndexAddress, packageName) {
  return new Promise(function(resolve, reject) {
    getPackageIndex(packageIndexAddress).then(function(packageIndex) {
      packageIndex.getAllPackageReleaseHashes.call(packageName, function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
  })
}

export function getPackageReleaseHash(packageIndexAddress, packageName, releaseIdx) {
  return new Promise(function(resolve, reject) {
    getPackageIndex(packageIndexAddress).then(function(packageIndex) {
      packageIndex.getReleaseHashForPackage.call(packageName, releaseIdx, function(err, result) {
        if (!err) {
          resolve(result)
        } else {
          reject(err)
        }
      })
    })
  })
}

export function getReleaseData(packageIndexAddress, releaseHash) {
  return new Promise(function(resolve, reject) {
    getPackageIndex(packageIndexAddress).then(function(packageIndex) {
      packageIndex.getReleaseData.call(releaseHash, function(err, result) {
        if (!err) {
          resolve({
            major: result[0].toNumber(),
            minor: result[1].toNumber(),
            patch: result[2].toNumber(),
            preRelease: result[3],
            build: result[4],
            releaseLockfileURI: result[5],
            createdAt: new Date(result[6].toNumber()),
            updatedAt: new Date(result[7].toNumber()),
          })
        } else {
          reject(err)
        }
      })
    })
  })
}
