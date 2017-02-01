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
        Immutable.fromJS({
          meta: {
            packageIndexAddress: action.packageIndexAddress,
          },
          packageData: {
            meta: {},
            packages: {},
            packageList: [],
          },
          releaseData: {
            meta: {},
            releases: {},
            releaseList: [],
          }
        })
      )
      break
    case TYPES.SET_PACKAGE_DB_ADDRESS:
      newState = newState.setIn(
        [action.packageIndexAddress, 'meta', 'packageDbAddress'],
        action.packageDbAddress,
      )
      break
    case TYPES.SET_RELEASE_DB_ADDRESS:
      newState = newState.setIn(
        [action.packageIndexAddress, 'meta', 'releaseDbAddress'],
        action.releaseDbAddress,
      )
      break
    case TYPES.SET_NUM_PACKAGES:
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageData', 'meta', 'numPackages'],
        action.numPackages,
      )
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageData', 'packageList'],
        newState.getIn([action.packageIndexAddress, 'packageData', 'packageList']).setSize(
          action.numPackages,
        ),
      )
      break
    case TYPES.SET_TOTAL_NUM_RELEASES:
      newState = newState.setIn(
        [action.packageIndexAddress, 'releaseData', 'meta', 'totalNumReleases'],
        action.totalNumReleases,
      )
      newState = newState.setIn(
        [action.packageIndexAddress, 'releaseData', 'releaseList'],
        newState.getIn([action.packageIndexAddress, 'releaseData', 'releaseList']).setSize(
          action.totalNumReleases,
        ),
      )
      break
    case TYPES.SET_PACKAGE_NAME:
      newState = newState.setIn(
        [action.packageIndexAddress, 'packageData', 'packageList', action.packageIdx],
        action.packageName,
      )
      break
    case TYPES.SET_PACKAGE_DATA:
      newState = newState.setIn(
        [
          action.packageIndexAddress,'packageData', 'packages',
          action.packageName,
        ],
        Immutable.fromJS(action.packageData),
      )
      break
    //
    // Breakpoint
    //
    case TYPES.SET_RELEASE_HASH:
      newState = newState.setIn(
        [
          action.packageIndexAddress, 'packageData', 'packages',
          action.packageIdx,
          'releaseData', 'releases',
          action.releaseIdx,
          'meta', 'releaseHash',
        ],
        action.releaseHash,
      )
      break
    case TYPES.SET_RELEASE_META:
      newState = newState.mergeIn(
        [
          action.packageIndexAddress, 'packageData', 'packages',
          action.packageIdx,
          'releaseData', 'releases',
          action.releaseIdx,
          'meta',
        ],
        Immutable.fromJS(action.releaseMeta),
      )
      break
    case TYPES.SET_RELEASE_DATA:
      newState = newState.mergeIn(
        [
          action.packageIndexAddress, 'packageData', 'packages',
          action.packageIdx,
          'releaseData', 'releases',
          action.releaseIdx,
          'data',
        ],
        Immutable.fromJS(action.releaseData),
      )
      break
    case TYPES.SET_RELEASE_LOADED:
      newState = newState.setIn(
        [
          action.packageIndexAddress, 'packageData', 'packages',
          action.packageIdx,
          'releaseData', 'releases',
          action.releaseIdx,
          'meta', 'isLoaded',
        ],
        true,
      )
      break
  }

  return newState
}
