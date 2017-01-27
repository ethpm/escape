import Immutable from 'immutable'
import TYPES from '../actions/types'

var initialState = Immutable.fromJS({
  indexData: {}
})

export default function(state, action) {
  if (state === undefined) {
    return initialState
  }

  var newState = state

  switch (action.type) {
    case TYPES.SET_EMPTY_INDEX_DATA:
      newState = newState.set(
        action.packageIndexAddress,
        Immutable.Map({isInitialized: false}),
      )
      break
    case TYPES.SET_INDEX_INITIALIZED:
      newState = newState.setIn(
        [action.packageIndexAddress, 'isInitialized'],
        true,
      )
      break
    case TYPES.SET_PACKAGE_DB_ADDRESS:
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageDbAddress'],
        action.packageDbAddress,
      )
      break
    case TYPES.SET_NUM_PACKAGES:
      newState = newState.setIn(
        [action.packageIndexAddress, 'numPackages'],
        action.numPackages,
      )
      break
    case TYPES.SET_NUM_RELEASES:
      newState = newState.setIn(
        [action.packageIndexAddress, 'numReleases'],
        action.numReleases,
      )
      break
    case TYPES.SET_EMPTY_PACKAGE_DATA:
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageData'],
        Immutable.fromJS({
          packages: [],
          isInitialized: false,
        })
      )
      break
    case TYPES.SET_PACKAGE_DATA_INITIALIZED:
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageData', 'isInitialized'],
        true,
      )
      break
    case TYPES.SET_EMPTY_PACKAGE_META:
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageData', 'packages'],
        newState.getIn(
          [action.packageIndexAddress, 'packageData', 'packages'],
        ).set(
          action.idx,
          Immutable.Map({
            meta: Immutable.Map({isLoaded: false}),
          }),
        ),
      )
      break
    case TYPES.SET_PACKAGE_META:
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageData', 'packages'],
        newState.getIn([action.packageIndexAddress, 'packageData', 'packages']).set(
          action.idx,
          newState.getIn([action.packageIndexAddress, 'packageData', 'packages']).get(
            action.idx,
          ).mergeIn(
            ['meta'],
            Immutable.fromJS(action.data),
          )
        ),
      )
      break
    case TYPES.SET_PACKAGE_META_LOADED:
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageData', 'packages'],
        newState.getIn([action.packageIndexAddress, 'packageData', 'packages']).set(
          action.idx,
          newState.getIn([action.packageIndexAddress, 'packageData', 'packages']).get(
            action.idx,
          ).setIn(
            ['meta', 'isLoaded'],
            true,
          )
        ),
      )
      break
  }

  return newState
}
