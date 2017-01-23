import _ from 'lodash'
import TYPES from './types'
import { getPackageDbAddress } from '../services/package_index'

export function loadPackageDbAddress(packageIndexAddress) {
  return function(dispatch, getState) {
    getPackageDbAddress().then(function(result) {
      let state = getState()
      if (_.has(state.packageIndex, packageIndexAddress)) {
        dispatch(initializePackageIndex(packageIndexAddress))
      }
      dispatch(setPackageDbAddress(packageIndexAddress, result))
    }, function(error) {
      console.error(error)
    })
  }
}

export function initializePackageIndex(packageIndexAddress) {
  return {
    type: TYPES.INITIALIZE_PACKAGE_INDEX_DB,
    packageIndexAddress: packageIndexAddress,
  }
}

export function setPackageDbAddress(packageIndexAddress, packageDbAddress) {
  return {
    type: TYPES.SET_PACKAGE_DB_ADDRESS,
    packageIndexAddress: packageIndexAddress,
    packageDbAddress: packageDbAddress,
  }
}
