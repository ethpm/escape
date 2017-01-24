import TYPES from '../actions/types'


let initialState = {
  PACKAGE_INDEX_ADDRESS: '0x1c5e00e663b403ea740317e14c740f9186e574d6',
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
