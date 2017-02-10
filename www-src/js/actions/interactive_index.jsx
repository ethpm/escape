import TYPES from './types'


export function setInteractivePackageNameFormInput(package_name) {
  return {
    type: TYPES.SET_INTERACTIVE_PACKAGE_NAME_FORM_INPUT,
    value: package_name
  }
}

export function setInteractivePackage(package_name) {
  return {
    type: TYPES.SET_INTERACTIVE_PACKAGE,
    value: package_name,
  }
}

export function setInteractiveStatus(status) {
  return {
    type: TYPES.SET_INTERACTIVE_STATUS,
    value: status,
  }
}

export function setInteractiveLoading(loading) {
  return {
    type: TYPES.SET_INTERACTIVE_LOADING,
    value: loading,
  }
}

export function setInteractiveDeployedContract(deployed_contract) {
  return {
    type: TYPES.SET_INTERACTIVE_DEPLOYED_CONTRACT,
    value: deployed_contract,
  }
}

export function setInteractiveContractTypes(contract_types) {
  return {
    type: TYPES.SET_INTERACTIVE_CONTRACT_TYPES,
    value: contract_types,
  }
}

export function setInteractiveDeployments(deployment_data) {
  return {
    type: TYPES.SET_INTERACTIVE_DEPLOYMENTS,
    value: deployment_data,
  }
}

export function setInteractiveCurrentlyProcessingFunction(function_signature) {
  return {
    type: TYPES.SET_INTERACTIVE_CURRENTLY_PROCESSING_FUNCTION,
    value: function_signature
  }
}

export function setInteractiveInputValue(key, value) {
  return {
    type: TYPES.SET_INTERACTIVE_INPUT_VALUE,
    key: key,
    value: value
  }
}

export function setInteractiveFunctionResult(function_signature, result) {
  return {
    type: TYPES.SET_INTERACTIVE_FUNCTION_RESULT,
    function_signature: function_signature,
    result: result
  }
}

export function clearInteractiveInputValues() {
  return {
    type: TYPES.CLEAR_INTERACTIVE_INPUT_VALUES
  }
}

export function clearInteractiveFunctionResults() {
  return {
    type: TYPES.CLEAR_INTERACTIVE_FUNCTION_RESULTS
  }
}
