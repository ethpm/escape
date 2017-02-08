import TYPES from './types'



export function setThing(value) {
  return {
    type: TYPES.SET_THING,
    value: value,
  }
}
