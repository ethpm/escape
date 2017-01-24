import TYPES from '../actions/types'


export function updateConfig(config) {
  return function(dispatch, getState) {
    dispatch(setConfig(config))
    return Promise.resolve()
  }
}

export function setConfig(config) {
  return {
    type: TYPES.SET_CONFIG,
    config: config,
  }
}
