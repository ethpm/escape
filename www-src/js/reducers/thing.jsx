import Immutable from 'immutable'
import TYPES from '../actions/types'

var initialState = Immutable.fromJS({
  thingValue: 'initial-value'
})

export default function(state, action) {
  if (state === undefined) {
    return initialState
  }

  var newState = state

  switch (action.type) {
    case TYPES.SET_THING:
      newState = newState.set('thingValue', action.value)
      break
  }

  return newState
}
