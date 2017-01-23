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
    case TYPES.INITIALIZE_PACKAGE_INDEX_DB:
      newState = _.merge(
        {},
        newState,
        {[action.packageIndexAddress]: {}},
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
  }

  return newState
}
