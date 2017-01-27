import _ from 'lodash'
import TYPES from './types'
import { getPackageDbAddress, getReleaseDbAddress, getNumPackages, getTotalNumReleases, getPackageName, getPackageData } from '../services/package_index'

export function triggerIndexMetaLoad(packageIndexAddress) {
  /*
   *  Initializer for the data associated with a package index.  Initializes
   *  the storage data to an empty object and then loads any of the index level
   *  metadata.
   */
  return function(dispatch, getState) {
    // First check to see if we're already initialized.  If so, return early.
    let state = getState()

    // Make sure that there is an object in place
    if (_.isEmpty(state.packageIndex.get(packageIndexAddress))) {
      dispatch(setEmptyIndexMeta(packageIndexAddress))
    }

    // Now l
    return dispatch(loadIndexMeta(packageIndexAddress)).then(function(result) {
      dispatch(setIndexMetaLoaded(packageIndexAddress))
      return Promise.resolve()
    }, function(error) {
      console.error(error)
    })
  }
}

export function loadIndexMeta(packageIndexAddress) {
  return function(dispatch, getState) {
    // First check to see if we're already initialized.  If so, return early.
    let state = getState()

    // Now l
    return Promise.all([
      dispatch(loadPackageDbAddress(packageIndexAddress)),
      dispatch(loadReleaseDbAddress(packageIndexAddress)),
      dispatch(loadNumPackages(packageIndexAddress)),
      dispatch(loadNumReleases(packageIndexAddress)),
    ])
  }
}

export function setEmptyIndexMeta(packageIndexAddress) {
  /*
   * Write an empty object into the storage for the given packageIndexAddress.
   */
  return {
    type: TYPES.SET_EMPTY_INDEX_META,
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

export function loadNumReleases(packageIndexAddress) {
  /*
   * Loads the number of releases that are tracked in the package index.
   */
  return function(dispatch, getState) {
    return getTotalNumReleases(packageIndexAddress).then(function(result) {
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

export function setIndexMetaLoaded(packageIndexAddress) {
  /*
   * Mark the package index data as having been initialized.
   */
  return {
    type: TYPES.SET_INDEX_META_LOADED,
    packageIndexAddress: packageIndexAddress,
  }
}

export function triggerIndexDataLoad(packageIndexAddress) {
  return function(dispatch, getState) {
    let state = getState()
    let packageIndexData = state.packageIndex.get(packageIndexAddress)

    if (_.isEmpty(state.packageIndex.getIn([packageIndexAddress, 'packageData']))) {
      dispatch(setEmptyIndexData(packageIndexAddress))
    }

    return dispatch(loadIndexData(packageIndexAddress)).then(function(result) {
      dispatch(setIndexDataLoaded(packageIndexAddress))
      return Promise.resolve()
    }, function(error) {
      console.error(error)
    })
  }
}

export function loadIndexData(packageIndexAddress) {
  return function(dispatch, getState) {
    let state = getState()
    return Promise.all(
      _.chain(state.packageIndex.getIn([packageIndexAddress, 'numPackages']))
       .range()
       .map(function(idx) {
         return dispatch(triggerPackageMetaLoad(packageIndexAddress, idx));
       })
       .value()
    )
  }
}

export function setEmptyIndexData(packageIndexAddress) {
  return {
    type: TYPES.SET_EMPTY_INDEX_DATA,
    packageIndexAddress: packageIndexAddress,
  }
}

export function setIndexDataLoaded(packageIndexAddress) {
  return {
    type: TYPES.SET_INDEX_DATA_LOADED,
    packageIndexAddress: packageIndexAddress,
  }
}

export function triggerPackageMetaLoad(packageIndexAddress, idx) {
  return function(dispatch, getState) {
    let packages= getState().packageIndex.getIn(
      [packageIndexAddress, 'packageData', 'packages'],
    )

    if (_.isEmpty(packages.get(idx))) {
      dispatch(setEmptyPackageMeta(packageIndexAddress, idx))
    }

    return dispatch(loadPackageMeta(packageIndexAddress, idx)).then(function(result) {
      dispatch(setPackageMetaLoaded(packageIndexAddress, idx))
      return Promise.resolve()
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
    return Promise.all([
      dispatch(loadPackageName(packageIndexAddress, idx)),
      dispatch(loadPackageMetaDetails(packageIndexAddress, idx)),
    ])
  }
}

export function loadPackageName(packageIndexAddress, idx) {
  return function(dispatch, getState) {
    return getPackageName(packageIndexAddress, idx).then(function(result) {
      return dispatch(setPackageName(packageIndexAddress, idx, result))
    }, function(error) {
      console.error(error)
    })
  }
}

export function loadPackageMetaDetails(packageIndexAddress, idx) {
  return function(dispatch, getState) {
    return getPackageName(packageIndexAddress, idx).then(function(packageName) {
      getPackageData(packageIndexAddress, packageName).then(function(result) {
        return dispatch(setPackageMetaDetails(packageIndexAddress, idx, result))
      }, function(error) {
        console.error(error)
      })
    })
  }
}

export function setPackageMetaDetails(packageIndexAddress, idx, metaDetails) {
  return {
    type: TYPES.SET_PACKAGE_META_DETAILS,
    packageIndexAddress: packageIndexAddress,
    idx: idx,
    metaDetails: metaDetails,
  }
}

export function setPackageName(packageIndexAddress, idx, name) {
  return {
    type: TYPES.SET_PACKAGE_NAME,
    packageIndexAddress: packageIndexAddress,
    idx: idx,
    name: name,
  }
}

export function setPackageMetaLoaded(packageIndexAddress, idx) {
  return {
    type: TYPES.SET_PACKAGE_META_LOADED,
    packageIndexAddress: packageIndexAddress,
    idx: idx,
  }
}

export function triggerPackageReleaseLoad(packageIndexAddress, idx) {
  return function(dispatch, getState) {
    return getPackageName(packageIndexAddress, idx).then(function(result) {
      let packages= getState().packageIndex.getIn([packageIndexAddress, 'packageData', 'packages'])

      if (_.isEmpty(packages.get(idx))) {
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
