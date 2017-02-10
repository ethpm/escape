import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSBreadcrumb from '../bootstrap/BSBreadcrumb'
import BlockchainUtils from 'truffle-blockchain-utils';
import axios from 'axios';
import actions from '../../actions'
import { getLatestRelease } from "../../services/package_index"
import { INFURA_ROPSTEN, getSelectedWeb3, getWeb3 } from "../../services/web3"
import LoadingSpinner from '../common/LoadingSpinner'

function mapStateToProps(state) {
  return {
    packageIndexAddress: state.config.PACKAGE_INDEX_ADDRESS,
    package_name_form_input: state.interactiveIndex.get('package_name_form_input'),
    package_name: state.interactiveIndex.get('package_name'),
    loading: state.interactiveIndex.get('loading'),
    status: state.interactiveIndex.get('status'),
    contract_types: state.interactiveIndex.get("contract_types"),
    deployments: state.interactiveIndex.get("deployments"),
    deployed_contract: state.interactiveIndex.get('deployed_contract'),
    currently_processing_function: state.interactiveIndex.get('currently_processing_function'),
    input_values: state.interactiveIndex.get('input_values'),
    function_results: state.interactiveIndex.get('function_results'),
  }
}

export default connect(mapStateToProps)(React.createClass({
  getPackageLockfileData(package_name) {
    function showError(err) {
      self.props.dispatch(actions.setInteractivePackage(""));
      self.props.dispatch(actions.setInteractiveStatus(err));
    }

    var self = this;
    var blockchains;
    var ropstenWeb3;
    var lockfile;
    getSelectedWeb3(INFURA_ROPSTEN).then(function(w) {
      ropstenWeb3 = w;
      return getLatestRelease(self.props.packageIndexAddress, package_name)
    }).then(function(release) {
      if (!release) {
        throw new Error("Package " + package_name + " does not exist.");
      }

      var lockfileURI = release.releaseLockfileURI;

      var path_name = lockfileURI.replace("ipfs://", "").replace("ipfs:", "");
      var gateway_uri = "https://gateway.ipfs.io/ipfs/" + path_name;

      return axios.get(gateway_uri);
    }).then(function(response) {
      lockfile = response.data;

      // Find the deployment that matches the current network
      blockchains = Object.keys(lockfile.deployments);

      var promises = blockchains.map(function(blockchain_uri) {
        return new Promise(function(accept, reject) {
          BlockchainUtils.matches(blockchain_uri, ropstenWeb3.currentProvider, function(err, matches) {
            if (err) return reject(err);
            accept(matches);
          });
        });
      });

      return Promise.all(promises);
    }).then(function(matching) {

      var match = matching.map(function(matches, index) {
        return [blockchains[index], matches];
      }).filter(function(tuple) {
        return tuple[1] == true;
      }).map(function(tuple) {
        return tuple[0];
      }).shift();

      if (match) {
        var deployedContracts = Object.keys(lockfile.deployments[match]).sort();

        if (deployedContracts.length == 0) {
          showError("Could not find any deployed contracts for this package.");
          return;
        }

        self.props.dispatch(actions.setInteractiveContractTypes(lockfile.contract_types));
        self.props.dispatch(actions.setInteractiveDeployments(lockfile.deployments[match]));
        self.props.dispatch(actions.setInteractiveDeployedContract(deployedContracts[0]));
        self.props.dispatch(actions.clearInteractiveInputValues());
        self.props.dispatch(actions.clearInteractiveFunctionResults());
        self.props.dispatch(actions.setInteractiveLoading(false));
      } else {
        showError("Could not find any deployed contracts for this package.");
      }
    }).catch(function(e) {
      console.log(e);
      showError(e.message);
    });
  },

  onTextChange(event) {
    this.props.dispatch(actions.setInteractivePackageNameFormInput(event.target.value));
    this.props.dispatch(actions.setInteractiveStatus(""));
  },

  onSelectPackage(event) {
    var package_name = this.props.package_name_form_input;

    this.props.dispatch(actions.setInteractiveLoading(true));
    this.props.dispatch(actions.setInteractivePackage(package_name));

    this.getPackageLockfileData(package_name);
  },

  renderLoading() {
    return (
      <div className="col-sm-12">
        <LoadingSpinner /> Loading Package...
      </div>
    )
  },

  renderStatus() {
    return (
      <div className="col-sm-12">
        {this.props.status}
      </div>
    )
  },

  render() {
    var body;

    if (this.props.loading == true) {
      body = this.renderLoading();
    } else if (this.props.status != "") {
      body = this.renderStatus();
    } else if (this.props.package_name != "") {
      body = <ContractChooser />
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <BSBreadcrumb>
              <BSBreadcrumb.Crumb linkTo="/" crumbText="Home" />
              <BSBreadcrumb.Crumb crumbText="Interactive" />
            </BSBreadcrumb>
          </div>
        </div>
        <div className="row">
          <h2 className="col-sm-12">Interactive</h2>
        </div>
        <div className="row">
          <div className="list-group col-sm-12">
            <div className="list-group-item list-group-item-action container">
              <div className="row">
                <div className="col-sm-7">
                  <h5 className="list-group-item-heading">Enter Package Name</h5>
                  <p className="list-group-item-text">Enter the name of the package you'd like to interact with.</p>
                </div>
                <div className="col-sm-4 text-xs-right">
                  <input type="text" className="form-control" placeholder="e.g., owned" value={this.props.package_name_form_input} onChange={this.onTextChange}/>
                </div>
                <div className="col-sm-1 text-xs-right">
                  <button className="btn btn-primary" onClick={this.onSelectPackage}>Go</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          {body}
        </div>
      </div>
    )
  }
}))

let ContractChooser = connect(mapStateToProps)(React.createClass({
  selectionChanged(event) {
    this.props.dispatch(actions.clearInteractiveInputValues());
    this.props.dispatch(actions.clearInteractiveFunctionResults());
    this.props.dispatch(actions.setInteractiveDeployedContract(event.target.value))
  },

  render() {
    console.log(this.props.deployed_contract, this.props.contract_types);

    // TODO: deployed_contract may not match keys correctly (i.e., if the hash is included)
    var contract = this.props.contract_types[this.props.deployed_contract];
    var deployment = this.props.deployments[this.props.deployed_contract];

    var choices = Object.keys(this.props.deployments).sort();

    var body;

    // cop out
    if (contract == null || deployment == null) {
      body = (
        <div className="col-sm-12">
          This contract references a contract within another package. This interface is still a work in progress, and doesn't let you interact with cross-referential packages. Please choose another contract or contact the EthPM developers for support.
        </div>
      )
    } else {
      body = (
        <div className="col-sm-12">
          <ABIInterface abi={contract.abi} contractAddress={deployment.address}/>
        </div>
      )
    }

    // Using divs with &nbsp; since spacing classes aren't available.
    // TODO: fix this.

    return (
      <div className="container">
        <div>
          &nbsp;
        </div>
        <div className="row">
          <div className="col-sm-12">
            <h4>Package: {this.props.package_name}</h4>
            Contract: <select value={this.props.deployed_contract} onChange={this.selectionChanged}>
            {
              choices.map(function(choice) {
                return <option key={"contract-option-" + choice} value={choice}>{choice}</option>
              })
            }
            </select>
          </div>
          <div>
            &nbsp;
          </div>
          <div className="row">
            {body}
          </div>
        </div>
      </div>
    )
  }
}))



let ABIInterface = connect(mapStateToProps)(React.createClass({
  makeTransaction(function_signature, transact) {
    this.props.dispatch(actions.setInteractiveCurrentlyProcessingFunction(function_signature));

    var self = this;

    if (transact !== false) {
      transact = true;
    }

    var contract;
    var web3;
    getWeb3().then(function(w) {
      web3 = w;
      return new Promise(function(accept, reject) {
        web3.eth.getAccounts(function(err, accounts) {
          if (err) return reject(err);
          accept(accounts);
        });
      });
    }).then(function(accounts) {
      return new Promise(function(accept, reject) {
        var Contract = web3.eth.contract(self.props.abi);
        contract = Contract.at(self.props.contractAddress);

        var function_name = function_signature.split("(")[0];
        var inputs = function_signature.substring(function_signature.indexOf("(") + 1, function_signature.indexOf(")")).split(", ");

        var args = inputs.map(function(input, index) {
          return self.props.input_values.get(self.getInputValueKey(function_signature, index));
        });

        // Push on our tx parameters and callback
        args.push({
          gas: 3141592,
          from: accounts[0]
        })

        args.push(function(err, result) {
          if (err) return reject(err);
          accept(result);
        })

        if (transact) {
          contract[function_name].apply(contract, args);
        } else {
          contract[function_name].call.apply(contract.call, args);
        }
      });
    }).then(function(result) {
      self.props.dispatch(actions.setInteractiveFunctionResult(function_signature, result))
    }).catch(function(e) {
      self.props.dispatch(actions.setInteractiveFunctionResult(function_signature, e.message || e))
    });
  },

  getInputValueKey(function_signature, index) {
    return function_signature + "-input-" + index;
  },

  setInputValue(function_signature, index, event) {
    var key = this.getInputValueKey(function_signature, index);
    this.props.dispatch(actions.setInteractiveInputValue(key, event.target.value));
  },

  getInputValue(function_signature, index) {
    var key = this.getInputValueKey(function_signature, index);
    return this.props.input_values.get(key);
  },

  doNotSubmitForm(event) {
    event.preventDefault()
  },

  render() {
    var self = this;
    var form_items = this.props.abi.map(function(item, index) {
      if (item.type != "function") {
        return null;
      }

      var function_signature = item.name + "(" + item.inputs.map(function(input) {
        return input.type + " " + input.name;
      }).join(", ") + ")";

      var function_name = (
        <div className="row">
          <div className="col-sm-8">
            <strong>
              {function_signature}
            </strong>
          </div>
          <div className="col-sm-3 text-right">
            <button className="btn btn-primary" onClick={self.makeTransaction.bind(self, function_signature, false)}>Call</button>
            &nbsp;
            <button className="btn btn-primary" onClick={self.makeTransaction.bind(self, function_signature)}>Transact</button>
          </div>
        </div>
      )

      var input_boxes = item.inputs.map(function(input, index) {
        return (
          <div key={function_signature + "-input-" + index} className="row">
            <label className="col-sm-2">
              {input.name}
            </label>
            <div className="col-sm-8">
              <input type="text" className="form-control" value={self.getInputValue(function_signature, index)} onChange={self.setInputValue.bind(self, function_signature, index)}/>
            </div>
          </div>
        )
      });

      var result_text = self.props.function_results.get(function_signature);
      if (result_text) {
        result_text = "Result: " + result_text
      } else {
        result_text = <div>&nbsp;</div>
      }
      var results = (
        <div className="row">
          <div className="col-sm-12">
            {result_text}
            <div>
              &nbsp;
            </div>
          </div>
        </div>
      )

      return (
        <div key={"abi-item-" + index} className="row">
          <div className="col-sm-12">
            {function_name}
            {input_boxes}
            {results}
          </div>
        </div>
      )
    }).filter(function(result) {
      return result != null;
    });

    return (
      <form className="container" onSubmit={self.doNotSubmitForm}>
        {form_items}
      </form>
    )
  }
}))
