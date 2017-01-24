import _ from 'lodash'
import TYPES from '../actions/types'

var initialState = {
  indexData: {}
}

export default function(state, action) {
  if (state === undefined) {
    return initialState
  }

  var newState = state

  switch (action.type) {
    case TYPES.SET_EMPTY_PACKAGE_INDEX_DATA:
      newState = _.merge(
        {},
        newState,
        {[action.packageIndexAddress]: {}},
      )
    case TYPES.SET_IS_INITIALIZED:
      newState = _.merge(
        {},
        newState,
        {
          [action.packageIndexAddress]: _.merge(
            {},
            newState[action.packageIndexAddress],
            {isInitialized: true},
          )
        }
      )
    case TYPES.SET_PACKAGE_DB_ADDRESS:
      newState = _.merge(
        {},
        newState,
        {
          [action.packageIndexAddress]: _.merge(
            {},
            newState[action.packageIndexAddress],
            {packageDbAddress: action.packageDbAddress},
          )
        }
      )
    case TYPES.SET_NUM_PACKAGES:
      newState = _.merge(
        {},
        newState,
        {
          [action.packageIndexAddress]: _.merge(
            {},
            newState[action.packageIndexAddress],
            {numPackages: action.numPackages},
          )
        }
      )
    case TYPES.SET_NUM_RELEASES:
      newState = _.merge(
        {},
        newState,
        {
          [action.packageIndexAddress]: _.merge(
            {},
            newState[action.packageIndexAddress],
            {numReleases: action.numReleases},
          )
        }
      )
  }

  return newState
}
