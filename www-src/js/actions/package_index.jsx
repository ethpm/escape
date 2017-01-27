import _ from 'lodash'
import TYPES from './types'
import { getPackageDbAddress, getReleaseDbAddress, getNumPackages, getNumReleases, getPackageName } from '../services/package_index'

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
    type: TYPES.SET_PACKAGE_DB_ADDRESS,
    packageIndexAddress: packageIndexAddress,
    releaseDbAddress: releaseDbAddress,
  }
}

export function initializeIndex(packageIndexAddress) {
  /*
   *  Initializer for the data associated with a package index.  Initializes
   *  the storage data to an empty object and then loads any of the index level
   *  metadata.
   */
  return function(dispatch, getState) {
    // First check to see if we're already initialized.  If so, return early.
    let state = getState()

    // Make sure that there is an object in place
    if (!_.isObject(_.get(state.packageIndex, packageIndexAddress, null))) {
      dispatch(setEmptyIndexData(packageIndexAddress))
    }

    // Now l
    return Promise.all([
      dispatch(loadPackageDbAddress(packageIndexAddress)),
      dispatch(loadNumPackages(packageIndexAddress)),
      dispatch(loadNumReleases(packageIndexAddress)),
    ]).then(function(result) {
      dispatch(setIndexInitialized(packageIndexAddress))
      return Promise.resolve()
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

export function setIndexInitialized(packageIndexAddress) {
  /*
   * Mark the package index data as having been initialized.
   */
  return {
    type: TYPES.SET_INDEX_INITIALIZED,
    packageIndexAddress: packageIndexAddress,
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

export function loadNumReleases(packageIndexAddress) {
  /*
   * Loads the number of releases that are tracked in the package index.
   */
  return function(dispatch, getState) {
    return getNumReleases(packageIndexAddress).then(function(result) {
      dispatch(setNumReleases(packageIndexAddress, result))
      return Promise.resolve(result)
    }, function(error) {
      console.error(error)
    })
  }
}

export function setNumReleases(packageIndexAddress, numReleases) {
  /*
   * Setter for `loadNumPackages`
   */
  return {
    type: TYPES.SET_NUM_RELEASES,
    packageIndexAddress: packageIndexAddress,
    numReleases: numReleases,
  }
}

export function initializePackageData(packageIndexAddress) {
  return function(dispatch, getState) {
    let state = getState()
    let packageIndexData = state.packageIndex[packageIndexAddress]
    if (_.isEmpty(_.get(packageIndexData, 'packageData'))) {
      dispatch(setEmptyPackageData(packageIndexAddress))
    }

    return Promise.all(
      _.chain(packageIndexData.numPackages)
       .range()
       .map(function(idx) {
         return dispatch(triggerPackageMetaLoad(packageIndexAddress, idx));
       })
       .value()
    ).then(function(result) {
      dispatch(setPackageDataInitialized(packageIndexAddress))
      return Promise.resolve()
    }, function(error) {
      console.error(error)
    })
  }
}

export function setEmptyPackageData(packageIndexAddress) {
  return {
    type: TYPES.SET_EMPTY_PACKAGE_DATA,
    packageIndexAddress: packageIndexAddress,
  }
}

export function setPackageDataInitialized(packageIndexAddress) {
  return {
    type: TYPES.SET_PACKAGE_DATA_INITIALIZED,
    packageIndexAddress: packageIndexAddress,
  }
}

export function triggerPackageMetaLoad(packageIndexAddress, idx) {
  return function(dispatch, getState) {
    return getPackageName(packageIndexAddress, idx).then(function(result) {
      let packageData = getState().packageIndex[packageIndexAddress].packageData

      if (_.isEmpty(_.get(packageData.packages, idx))) {
        dispatch(setEmptyPackageMeta(packageIndexAddress, idx))
      }

      dispatch(loadPackageMeta(packageIndexAddress, idx)).then(function(result) {
        dispatch(setPackageMetaLoaded(packageIndexAddress, idx))
        return Promise.resolve()
      }, function(error) {
        console.error(error)
      })
    }, function(error) {
      console.error(error)
    })
  }
}

export function setEmptyPackageMeta(packageIndexAddress, idx) {
  return {
    type: TYPES.SET_EMPTY_PACKAGE_META,
    packageIndexAddress: packageIndexAddress,
    idx: idx,
  }
}

export function loadPackageMeta(packageIndexAddress, idx) {
  return function(dispatch, getState) {
    return getPackageName(packageIndexAddress, idx).then(function(result) {
      dispatch(setPackageMeta(packageIndexAddress, idx, {
        idx: idx,
        name: result,
      }))
      return Promise.resolve(result)
    }, function(error) {
      console.error(error)
    })
  }
}

export function setPackageMeta(packageIndexAddress, idx, data) {
  return {
    type: TYPES.SET_PACKAGE_META,
    packageIndexAddress: packageIndexAddress,
    data: data,
    idx: idx,
  }
}

export function setPackageMetaLoaded(packageIndexAddress, idx) {
  return {
    type: TYPES.SET_PACKAGE_META_LOADED,
    packageIndexAddress: packageIndexAddress,
    idx: idx,
  }
}
