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
    case TYPES.SET_EMPTY_INDEX_DATA:
      newState = _.merge(
        {},
        newState,
        {
          [action.packageIndexAddress]: {
            isInitialized: false,
          },
        },
      )
    case TYPES.SET_INDEX_INITIALIZED:
      newState = _.merge(
        {},
        newState,
        {
          [action.packageIndexAddress]: _.merge(
            {},
            newState[action.packageIndexAddress],
            {isInitialized: true},
          ),
        },
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
          ),
        },
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
          ),
        },
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
          ),
        },
      )
    case TYPES.SET_EMPTY_PACKAGE_DATA:
      newState = _.merge(
        {},
        newState,
        {
          [action.packageIndexAddress]: _.merge(
            {},
            newState[action.packageIndexAddress],
            {
              packageData: {
                packages: [],
                isInitialized: false,
              },
            },
          ),
        },
      )
    case TYPES.SET_PACKAGE_DATA_INITIALIZED:
      newState = _.merge(
        {},
        newState,
        {
          [action.packageIndexAddress]: _.merge(
            {},
            newState[action.packageIndexAddress],
            {
              packageData: _.merge(
                {},
                newState[action.packageIndexAddress].packageData,
                {isInitialized: true},
              ),
            },
          ),
        },
      )
    case TYPES.SET_EMPTY_PACKAGE:
      newState = _.merge(
        {},
        newState,
        {
          [action.packageIndexAddress]: _.merge(
            {},
            newState[action.packageIndexAddress],
            {
              packageData: _.merge(
                {},
                newState[action.packageIndexAddress].packageData,
                {
                  packages: _.merge(
                    [],
                    newState[action.packageIndexAddress].packageData.packages,
                    {[action.idx]: {isInitialized: false}},
                  ),
                },
              ),
            },
          ),
        },
      )
    case TYPES.SET_PACKAGE:
      newState = _.merge(
        {},
        newState,
        {
          [action.packageIndexAddress]: _.merge(
            {},
            newState[action.packageIndexAddress],
            {
              packageData: _.merge(
                {},
                newState[action.packageIndexAddress].packageData,
                {
                  packages: _.merge(
                    [],
                    newState[action.packageIndexAddress].packageData.packages,
                    {
                      [action.idx]: _.merge(
                        {},
                        newState[action.packageIndexAddress].packageData.packages[action.idx],
                        action.data,
                      ),
                    },
                  ),
                },
              ),
            },
          ),
        },
      )
    case TYPES.SET_PACKAGE_INITIALIZED:
      newState = _.merge(
        {},
        newState,
        {
          [action.packageIndexAddress]: _.merge(
            {},
            newState[action.packageIndexAddress],
            {
              packageData: _.merge(
                {},
                newState[action.packageIndexAddress].packageData,
                {
                  packages: _.merge(
                    [],
                    newState[action.packageIndexAddress].packageData.packages,
                    {
                      [action.idx]: _.merge(
                        {},
                        newState[action.packageIndexAddress].packageData.packages[action.idx],
                        {isInitialized: true},
                      ),
                    },
                  ),
                },
              ),
            },
          ),
        },
      )
  }

  return newState
}
