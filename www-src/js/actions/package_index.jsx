import _ from 'lodash'
import TYPES from './types'
import { getPackageDbAddress, getNumPackages, getNumReleases } from '../services/package_index'

export function loadPackageDbAddress(packageIndexAddress) {
  return function(dispatch, getState) {
    getPackageDbAddress(packageIndexAddress).then(function(result) {
      dispatch(setPackageDbAddress(packageIndexAddress, result))
      return Promise.resolve(result)
    }, function(error) {
      console.error(error)
    })
  }
}

export function setPackageDbAddress(packageIndexAddress, packageDbAddress) {
  return {
    type: TYPES.SET_PACKAGE_DB_ADDRESS,
    packageIndexAddress: packageIndexAddress,
    packageDbAddress: packageDbAddress,
  }
}

export function initializePackageIndex(packageIndexAddress) {
  return function(dispatch, getState) {
    dispatch(setEmptyPackageIndexData(packageIndexAddress))

    Promise.all([
      dispatch(loadPackageDbAddress(packageIndexAddress)),
      dispatch(loadNumPackages(packageIndexAddress)),
      dispatch(loadNumReleases(packageIndexAddress)),
    ]).then(function(result) {
      dispatch(setIsInitialized(packageIndexAddress))
    }, function(error) {
      console.error(error)
    })
  }
}

export function setIsInitialized(packageIndexAddress) {
  return {
    type: TYPES.SET_IS_INITIALIZED,
    packageIndexAddress: packageIndexAddress,
  }
}

export function setEmptyPackageIndexData(packageIndexAddress) {
  return {
    type: TYPES.SET_EMPTY_PACKAGE_INDEX_DATA,
    packageIndexAddress: packageIndexAddress,
  }
}

export function loadNumPackages(packageIndexAddress) {
  return function(dispatch, getState) {
    getNumPackages(packageIndexAddress).then(function(result) {
      let state = getState()
      dispatch(setNumPackages(packageIndexAddress, result))
      return Promise.resolve(result)
    }, function(error) {
      console.error(error)
    })
  }
}

export function setNumPackages(packageIndexAddress, numPackages) {
  return {
    type: TYPES.SET_NUM_PACKAGES,
    packageIndexAddress: packageIndexAddress,
    numPackages: numPackages,
  }
}

export function loadNumReleases(packageIndexAddress) {
  return function(dispatch, getState) {
    getNumReleases(packageIndexAddress).then(function(result) {
      let state = getState()
      dispatch(setNumReleases(packageIndexAddress, result))
      return Promise.resolve(result)
    }, function(error) {
      console.error(error)
    })
  }
}

export function setNumReleases(packageIndexAddress, numReleases) {
  return {
    type: TYPES.SET_NUM_RELEASES,
    packageIndexAddress: packageIndexAddress,
    numReleases: numReleases,
  }
}
