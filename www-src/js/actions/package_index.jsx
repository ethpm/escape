import _ from 'lodash'
import TYPES from './types'
import { getPackageDbAddress, getReleaseDbAddress, getNumPackages, getTotalNumReleases, getPackageName, getPackageData, getAllPackageReleaseHashes, getReleaseData, getPackageReleaseHash } from '../services/package_index'

/*
 * Index Level Actions
 */
export function loadIndexData(packageIndexAddress) {
  return function(dispatch, getState) {
    // First check to see if we're already initialized.  If so, return early.
    let state = getState()
    if (!state.packageIndex.has(packageIndexAddress)) {
      dispatch(setEmptyIndexData(packageIndexAddress))
    }

    // Now l
    return Promise.all([
      dispatch(loadPackageDbAddress(packageIndexAddress)),
      dispatch(loadReleaseDbAddress(packageIndexAddress)),
      dispatch(loadNumPackages(packageIndexAddress)),
      dispatch(loadTotalNumReleases(packageIndexAddress)),
    ]).then(function(result) {
      return Promise.resolve(result)
    }, function(error) {
      console.error(error)
    })
  }
}

export function setEmptyIndexData(packageIndexAddress) {
  /*
   * Write an empty object into the storage for the given packageIndexAddress.
   */
  return {
    type: TYPES.SET_EMPTY_INDEX_DATA,
    packageIndexAddress: packageIndexAddress,
  }
}

export function loadPackageDbAddress(packageIndexAddress) {
  /*
   *  Loads the current PackageDB address for the package index.
   */
  return function(dispatch, getState) {
    return getPackageDbAddress(packageIndexAddress).then(function(result) {
      dispatch(setPackageDbAddress(packageIndexAddress, result))
      return Promise.resolve(result)
    }, function(error) {
      console.error(error)
    })
  }
}

export function setPackageDbAddress(packageIndexAddress, packageDbAddress) {
  /*
   *  Setter for `loadPackageDbAddress`
   */
  return {
    type: TYPES.SET_PACKAGE_DB_ADDRESS,
    packageIndexAddress: packageIndexAddress,
    packageDbAddress: packageDbAddress,
  }
}

export function loadReleaseDbAddress(packageIndexAddress) {
  /*
   *  Loads the current ReleaseDB address for the package index.
   */
  return function(dispatch, getState) {
    return getReleaseDbAddress(packageIndexAddress).then(function(result) {
      dispatch(setReleaseDbAddress(packageIndexAddress, result))
      return Promise.resolve(result)
    }, function(error) {
      console.error(error)
    })
  }
}

export function setReleaseDbAddress(packageIndexAddress, releaseDbAddress) {
  /*
   *  Setter for `loadReleaseDbAddress`
   */
  return {
    type: TYPES.SET_RELEASE_DB_ADDRESS,
    packageIndexAddress: packageIndexAddress,
    releaseDbAddress: releaseDbAddress,
  }
}

export function loadNumPackages(packageIndexAddress) {
  /*
   * Loads the number of packages that are tracked in the package index.
   */
  return function(dispatch, getState) {
    return getNumPackages(packageIndexAddress).then(function(result) {
      dispatch(setNumPackages(packageIndexAddress, result))
      return Promise.resolve(result)
    }, function(error) {
      console.error(error)
    })
  }
}

export function setNumPackages(packageIndexAddress, numPackages) {
  /*
   * Setter for `loadNumPackages`
   */
  return {
    type: TYPES.SET_NUM_PACKAGES,
    packageIndexAddress: packageIndexAddress,
    numPackages: numPackages,
  }
}

export function loadTotalNumReleases(packageIndexAddress) {
  /*
   * Loads the number of releases that are tracked in the package index.
   */
  return function(dispatch, getState) {
    return getTotalNumReleases(packageIndexAddress).then(function(result) {
      dispatch(setTotalNumReleases(packageIndexAddress, result))
      return Promise.resolve(result)
    }, function(error) {
      console.error(error)
    })
  }
}

export function setTotalNumReleases(packageIndexAddress, totalNumReleases) {
  /*
   * Setter for `loadNumPackages`
   */
  return {
    type: TYPES.SET_TOTAL_NUM_RELEASES,
    packageIndexAddress: packageIndexAddress,
    totalNumReleases: totalNumReleases,
  }
}

/*
 * Packages
 */
export function loadPackageList(packageIndexAddress) {
  return function(dispatch, getState) {
    let state = getState()
    let packageList = state.getIn([packageIndexAddress, 'packageData', 'packageList'])
    return Promise.all(
      _.chain(packageList.size)
       .range()
       .filter(packageList.has.bind(packageList))
       .forEach(function(packageIdx) {
         return dispatch(loadPackageName(packageIndexAddress, packageIdx));
       })
       .value()
    ).then(function(result) {
      return Promise.resolve(result)
    }, function(error) {
      console.error(error)
    })
  }
}

export function loadPackageName(packageIndexAddress, packageIdx) {
  return function(dispatch, getState) {
    return getPackageName(packageIndexAddress, packageIdx).then(function(result) {
      return dispatch(setPackageName(packageIndexAddress, packageIdx, result))
    }, function(error) {
      console.error(error)
    })
  }
}

export function setPackageName(packageIndexAddress, packageIdx, packageName) {
  return {
    type: TYPES.SET_PACKAGE_NAME,
    packageIndexAddress: packageIndexAddress,
    packageIdx: packageIdx,
    packageName: packageName,
  }
}

export function loadPackageData(packageIndexAddress, packageName) {
  return function(dispatch, getState) {
    return Promise.all([
      getPackageData(packageIndexAddress, packageName),
      getAllPackageReleaseHashes(packageIndexAddress, packageName),
    ]).then(function(result) {
      let [packageDetails, packageReleaseHashes] = result
      let packageData = {
        releases: packageReleaseHashes,
        meta: _.pick(packageDetails, ['createdAt', 'updatedAt']),
        details: {
          name: packageName,
          ..._.pick(packageDetails, ['owner', 'numReleases']),
        },
      }
      return dispatch(setPackageData(packageIndexAddress, packageName, packageData))
    }, function(error) {
      console.error(error)
    })
  }
}

export function setPackageData(packageIndexAddress, packageName, packageData) {
  return {
    type: TYPES.SET_PACKAGE_DATA,
    packageIndexAddress: packageIndexAddress,
    packageName: packageName,
    packageData: packageData,
  }
}

export function loadReleaseList(packageIndexAddress) {
  return function(dispatch, getState) {
    let state = getState()
    let releaseList = state.packageIndex.getIn(
      [packageIndexAddress, 'releaseData', 'releaseList']
    )
    return Promise.all(
      _.chain(releaseList.size)
       .range()
       .filter(releaseList.has.bind(releaseList))
       .map(function(packageIdx) {
         return dispatch(loadPackageName(packageIndexAddress, packageIdx));
       })
       .value()
    ).then(function(result) {
      return Promise.resolve()
    }, function(error) {
      console.error(error)
    })
  }
}

export function loadReleaseData(packageIndexAddress, releaseHash) {
  return function(dispatch, getState) {
    return getReleaseData(packageIndexAddress, releaseHash).then(function(result) {
      let releaseData = {
        meta: {
          releaseHash: releaseHash,
          ..._.pick(result, ['createdAt', 'updatedAt'])
        },
        details: _.pick(
          result,
          ['major', 'minor', 'patch', 'preRelease', 'build', 'releaseLockfileURI'],
        )
      }
      return dispatch(setReleaseData(packageIndexAddress, releaseHash, releaseData))
    }, function(error) {
      console.error(error)
    })
  }
}
