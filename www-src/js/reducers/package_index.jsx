import _ from 'lodash'
import TYPES from '../actions/types'

var initialState = {
  packageDbAddress: null,
};

export default function(state, action) {
  if (state === undefined) {
    return initialState;
  }

  var newState = state;

  switch (action.type) {
    case TYPES.SET_PACKAGE_DB_ADDRESS:
      newState = _.merge(
        {},
        newState,
        {packageDbAddress: action.address},
      );
  }

  return newState;
}
