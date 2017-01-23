import _ from 'lodash'
import TYPES from './types'
import { getPackageDbAddress } from '../services/package_index'

export function loadPackageDbAddress() {
  return function(dispatch, getState) {
    getPackageDbAddress().then(function(result) {
      dispatch(setPackageDbAddress(result))
    }, function(error) {
      console.error(error)
    })
  }
}

export function setPackageDbAddress(address) {
  return {
    type: TYPES.SET_PACKAGE_DB_ADDRESS,
    address: address,
  }
}
