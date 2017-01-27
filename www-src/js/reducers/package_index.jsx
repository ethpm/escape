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
    case TYPES.SET_EMPTY_INDEX_META:
      newState = newState.set(
        action.packageIndexAddress,
        Immutable.Map({isLoaded: false}),
      )
      break
    case TYPES.SET_INDEX_META_LOADED:
      newState = newState.setIn(
        [action.packageIndexAddress, 'isLoaded'],
        true,
      )
      break
    case TYPES.SET_PACKAGE_DB_ADDRESS:
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageDbAddress'],
        action.packageDbAddress,
      )
      break
    case TYPES.SET_RELEASE_DB_ADDRESS:
      newState = newState.setIn(
        [action.packageIndexAddress, 'releaseDbAddress'],
        action.releaseDbAddress,
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
    case TYPES.SET_EMPTY_INDEX_DATA:
      newState = newState.mergeIn(
        [action.packageIndexAddress, 'packageData'],
        Immutable.fromJS({
          packages: [],
          isLoaded: false,
        })
      )
      break
    case TYPES.SET_INDEX_DATA_LOADED:
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageData', 'isLoaded'],
        true,
      )
      break
    case TYPES.SET_EMPTY_PACKAGE_META:
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageData', 'packages'],
        newState.getIn([action.packageIndexAddress, 'packageData', 'packages']).set(
          action.idx,
          Immutable.fromJS({
            meta: {idx: action.idx, isLoaded: false},
          }),
        ),
      )
      break
    case TYPES.SET_PACKAGE_NAME:
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageData', 'packages'],
        newState.getIn([action.packageIndexAddress, 'packageData', 'packages']).set(
          action.idx,
          newState.getIn([action.packageIndexAddress, 'packageData', 'packages']).get(
            action.idx,
          ).mergeIn(
            ['meta'],
            Immutable.Map({name: action.name}),
          )
        ),
      )
      break
    case TYPES.SET_PACKAGE_META_DETAILS:
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageData', 'packages'],
        newState.getIn([action.packageIndexAddress, 'packageData', 'packages']).set(
          action.idx,
          newState.getIn([action.packageIndexAddress, 'packageData', 'packages']).get(
            action.idx,
          ).mergeIn(
            ['meta'],
            Immutable.fromJS(action.metaDetails),
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
