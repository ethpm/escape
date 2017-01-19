import TYPES from '../actions/types'


let initialState = {
  PACKAGE_INDEX_ADDRESS: '0xTODO',
};


export default function(state, action) {
  if (state === undefined) {
    return initialState;
  }

  let newState = state;

  switch (action.type) {
    case TYPES.SET_CONFIG:
      newState = _.merge(
        {},
        newState,
        action.config,
      );
  }

  return newState;
}
