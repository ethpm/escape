import _ from 'lodash'
import TYPES from './types'
import { getPackageDbAddress, getReleaseDbAddress, getNumPackages, getTotalNumReleases, getPackageName, getPackageData, getAllPackageReleaseHashes, getReleaseData, getPackageReleaseHash } from '../services/package_index'

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
       .map(function(packageIdx) {
         return dispatch(triggerPackageMetaLoad(packageIndexAddress, packageIdx));
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

export function triggerPackageMetaLoad(packageIndexAddress, packageIdx) {
  return function(dispatch, getState) {
    let packages = getState().packageIndex.getIn(
      [packageIndexAddress, 'packageData', 'packages'],
    )

    if (_.isEmpty(packages.getIn([packageIdx, 'meta']))) {
      dispatch(setEmptyPackageMeta(packageIndexAddress, packageIdx))
    }

    return dispatch(loadPackageMeta(packageIndexAddress, packageIdx)).then(function(result) {
      dispatch(setPackageMetaLoaded(packageIndexAddress, packageIdx))
      return Promise.resolve()
    }, function(error) {
      console.error(error)
    })
  }
}

export function setEmptyPackageMeta(packageIndexAddress, packageIdx) {
  return {
    type: TYPES.SET_EMPTY_PACKAGE_META,
    packageIndexAddress: packageIndexAddress,
    packageIdx: packageIdx,
  }
}

export function loadPackageMeta(packageIndexAddress, packageIdx) {
  return function(dispatch, getState) {
    return Promise.all([
      dispatch(loadPackageName(packageIndexAddress, packageIdx)),
      dispatch(loadPackageMetaDetails(packageIndexAddress, packageIdx)),
    ])
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

export function loadPackageMetaDetails(packageIndexAddress, packageIdx) {
  return function(dispatch, getState) {
    return getPackageName(packageIndexAddress, packageIdx).then(function(packageName) {
      getPackageData(packageIndexAddress, packageName).then(function(result) {
        return dispatch(setPackageMetaDetails(packageIndexAddress, packageIdx, result))
      }, function(error) {
        console.error(error)
      })
    })
  }
}

export function setPackageMetaDetails(packageIndexAddress, packageIdx, metaDetails) {
  return {
    type: TYPES.SET_PACKAGE_META_DETAILS,
    packageIndexAddress: packageIndexAddress,
    packageIdx: packageIdx,
    metaDetails: metaDetails,
  }
}

export function setPackageName(packageIndexAddress, packageIdx, name) {
  return {
    type: TYPES.SET_PACKAGE_NAME,
    packageIndexAddress: packageIndexAddress,
    packageIdx: packageIdx,
    name: name,
  }
}

export function setPackageMetaLoaded(packageIndexAddress, packageIdx) {
  return {
    type: TYPES.SET_PACKAGE_META_LOADED,
    packageIndexAddress: packageIndexAddress,
    packageIdx: packageIdx,
  }
}

export function triggerAllPackageReleasesLoad(packageIndexAddress, packageIdx) {
  return function(dispatch, getState) {
    let packages = getState().packageIndex.getIn(
      [packageIndexAddress, 'packageData', 'packages']
    )

    if (_.isEmpty(packages.getIn([packageIdx, 'releaseData']))) {
      dispatch(setEmptyPackageReleases(packageIndexAddress, packageIdx))
    }

    return dispatch(loadAllPackageReleases(packageIndexAddress, packageIdx)).then(function(result) {
      return dispatch(setPackageReleasesLoaded(packageIndexAddress, packageIdx))
    }, function(error) {
      console.error(error)
    })
  }
}

export function setEmptyPackageReleases(packageIndexAddress, packageIdx) {
  return {
    type: TYPES.SET_EMPTY_PACKAGE_RELEASES,
    packageIndexAddress: packageIndexAddress,
    packageIdx: packageIdx,
  }
}

export function setPackageReleasesLoaded(packageIndexAddress, packageIdx) {
  return {
    type: TYPES.SET_PACKAGE_RELEASES_LOADED,
    packageIndexAddress: packageIndexAddress,
    packageIdx: packageIdx,
  }
}

export function loadAllPackageReleases(packageIndexAddress, packageIdx) {
  return function(dispatch, getState) {
    return getPackageName(packageIndexAddress, packageIdx).then(function(packageName) {
      return getAllPackageReleaseHashes(packageIndexAddress, packageName).then(function(allReleaseHashes) {
        return Promise.all(
          _.chain(allReleaseHashes)
           .map(function(releaseHash, releaseIdx) {
             return dispatch(triggerReleaseLoad(
               packageIndexAddress,
               packageIdx,
               releaseIdx,
               releaseHash,
             ))
           })
           .value()
        )
      })
    })
  }
}

export function triggerReleaseLoad(packageIndexAddress, packageIdx, releaseIdx) {
  return function(dispatch, getState) {
    let release = getState().packageIndex.getIn(
      [packageIndexAddress, 'packageData', 'packages', packageIdx, 'releaseData', 'releases', releaseIdx]
    )
    if (_.isEmpty(release)) {
      dispatch(setEmptyReleaseData(packageIndexAddress, packageIdx, releaseIdx))
    }

    return dispatch(loadRelease(packageIndexAddress, packageIdx, releaseIdx)).then(function(result) {
      return dispatch(setReleaseLoaded(packageIndexAddress, packageIdx, releaseIdx))
    }, function(error) {
      console.error(error)
    })
  }
}

export function setEmptyReleaseData(packageIndexAddress, packageIdx, releaseIdx) {
  return {
    type: TYPES.SET_EMPTY_RELEASE_DATA,
    packageIndexAddress: packageIndexAddress,
    packageIdx: packageIdx,
    releaseIdx: releaseIdx,
  }
}

export function loadRelease(packageIndexAddress, packageIdx, releaseIdx) {
  return function(dispatch, getState) {
    return Promise.all([
      dispatch(loadReleaseHash(packageIndexAddress, packageIdx, releaseIdx)),
      dispatch(loadReleaseDetails(packageIndexAddress, packageIdx, releaseIdx)),
    ])
  }
}

export function loadReleaseHash(packageIndexAddress, packageIdx, releaseIdx) {
  return function(dispatch, getState) {
    return getPackageName(packageIndexAddress, packageIdx).then(function(packageName) {
      return getPackageReleaseHash(packageIndexAddress, packageName, releaseIdx).then(function(releaseHash) {
        return dispatch(setReleaseHash(packageIndexAddress, packageIdx, releaseIdx, releaseHash))
      }, function(error) {
        console.error(error)
      })
    }, function(error) {
      console.error(error)
    })
  }
}

export function setReleaseHash(packageIndexAddress, packageIdx, releaseIdx, releaseHash) {
  return {
    type: TYPES.SET_RELEASE_HASH,
    packageIndexAddress: packageIndexAddress,
    packageIdx: packageIdx,
    releaseIdx: releaseIdx,
    releaseHash: releaseHash,
  }
}

export function loadReleaseDetails(packageIndexAddress, packageIdx, releaseIdx) {
  return function(dispatch, getState) {
    return getPackageName(packageIndexAddress, packageIdx).then(function(packageName) {
      return getPackageReleaseHash(packageIndexAddress, packageName, releaseIdx).then(function(releaseHash) {
        return getReleaseData(packageIndexAddress, releaseHash).then(function(result) {
          let releaseMeta = _.pick(result, ['createdAt', 'updatedAt'])
          let releaseData = _.omit(result, ['createdAt', 'updatedAt'])

          dispatch(setReleaseMeta(packageIndexAddress, packageIdx, releaseIdx, releaseMeta))
          dispatch(setReleaseData(packageIndexAddress, packageIdx, releaseIdx, releaseData))
        }, function(error) {
          console.error(error)
        })
      }, function(error) {
        console.error(error)
      })
    }, function(error) {
      console.error(error)
    })
  }
}

export function setReleaseMeta(packageIndexAddress, packageIdx, releaseIdx, releaseMeta) {
  return {
    type: TYPES.SET_RELEASE_META,
    packageIndexAddress: packageIndexAddress,
    packageIdx: packageIdx,
    releaseIdx: releaseIdx,
    releaseMeta: releaseMeta,
  }
}

export function setReleaseData(packageIndexAddress, packageIdx, releaseIdx, releaseData) {
  return {
    type: TYPES.SET_RELEASE_DATA,
    packageIndexAddress: packageIndexAddress,
    packageIdx: packageIdx,
    releaseIdx: releaseIdx,
    releaseData: releaseData,
  }
}

export function setReleaseLoaded(packageIndexAddress, packageIdx, releaseIdx) {
  return {
    type: TYPES.SET_RELEASE_LOADED,
    packageIndexAddress: packageIndexAddress,
    packageIdx: packageIdx,
    releaseIdx: releaseIdx,
  }
}
