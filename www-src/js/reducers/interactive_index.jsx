import Immutable from 'immutable'
import TYPES from '../actions/types'

var initialState = Immutable.fromJS({
  package_name_form_input: "",
  package_name: "",
  loading: false,
  status: "",
  contract_types: null,
  deployments: null,
  deployed_contract: null,
  currently_processing_function: null,
  input_values: Immutable.fromJS({}),
  function_results: Immutable.fromJS({})
})

export default function(state, action) {
  if (state === undefined) {
   return initialState
  }

  var newState = state

  switch (action.type) {
    case TYPES.SET_INTERACTIVE_PACKAGE_NAME_FORM_INPUT:
      newState = newState.set('package_name_form_input', action.value)
      break
    case TYPES.SET_INTERACTIVE_PACKAGE:
      newState = newState.set('package_name', action.value)
      break
    case TYPES.SET_INTERACTIVE_LOADING:
      newState = newState.set('loading', action.value);
      break
    case TYPES.SET_INTERACTIVE_STATUS:
      newState = newState.set('status', action.value);
      newState = newState.set('loading', false);
      break
    case TYPES.SET_INTERACTIVE_DEPLOYMENTS:
      newState = newState.set('deployments', action.value);
      break;
    case TYPES.SET_INTERACTIVE_CONTRACT_TYPES:
      newState = newState.set('contract_types', action.value);
      break;
    case TYPES.SET_INTERACTIVE_DEPLOYED_CONTRACT:
      newState = newState.set('deployed_contract', action.value)
      break
    case TYPES.SET_INTERACTIVE_CURRENTLY_PROCESSING_FUNCTION:
      newState = newState.set('currently_processing_function', action.value)
      break
    case TYPES.SET_INTERACTIVE_INPUT_VALUE:
      newState = newState.setIn(['input_values', action.key], action.value)
      break
    case TYPES.SET_INTERACTIVE_FUNCTION_RESULT:
      newState = newState.setIn(['function_results', action.function_signature], action.result)
      break
    case TYPES.CLEAR_INTERACTIVE_INPUT_VALUES:
      newState = newState.set('input_values', Immutable.fromJS({}))
      break
    case TYPES.CLEAR_INTERACTIVE_FUNCTION_RESULTS:
      newState = newState.set('function_results', Immutable.fromJS({}))
      break
  }

  return newState
}
