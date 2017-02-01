import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import SyntaxHighlighter from "react-syntax-highlighter/dist/light"
import docco from 'react-syntax-highlighter/dist/styles/docco'; 
import actions from '../../actions'
import EthereumAddress from '../common/EthereumAddress'
import FAIcon from '../common/FAIcon'
import BSCard from '../bootstrap/BSCard'
import BSBreadcrumb from '../bootstrap/BSBreadcrumb'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS;
  return {
    packageIndexAddress: packageIndexAddress,
    numPackages: state.packageIndex.getIn(
      [packageIndexAddress, 'packageData', 'meta', 'numPackages']
    ),
    totalNumReleases: state.packageIndex.getIn(
      [packageIndexAddress, 'releaseData', 'meta', 'totalNumReleases']
    ),
  }
}

const POPULUS_CODE = "$ pip install populus\n$ populus package install owned"

export default connect(mapStateToProps)(React.createClass({
  render() {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-sm-12'>
            <BSBreadcrumb>
              <BSBreadcrumb.Crumb linkTo='/' crumbText='Home' />
              <BSBreadcrumb.Crumb crumbText='Registry' />
            </BSBreadcrumb>
          </div>
        </div>
        <div className='row'>
          <div className='col-sm-12'>
            <div className="jumbotron">
              <h2>The Ethereum Package Registry</h2>
              <p>The Ethereum Package Registry is a package index for Ethereum smart contract packages.  The registry is based on the <a href="https://github.com/ethereum/EIPs/issues/190" target="_blank">ERC190 Smart Contract Packaging Specification</a>.</p>
              <p>There are currently {this.props.numPackages} packages here with a total of {this.props.totalNumReleases} releases.</p>
              <p>You can view the Package Index contract on the Ropsten test network <a href="https://testnet.etherscan.io/address/0x8011df4830b4f696cd81393997e5371b93338878" target="_blank"><EthereumAddress imageSize={16} address="0x8011df4830b4f696cd81393997e5371b93338878" /></a></p>
              <Link className="btn btn-primary pull-right" to="registry/packages"><FAIcon icon="search" /> Browse Packages</Link>
            </div>
          </div>
          <div className='col-sm-6'>
            <BSCard>
              <BSCard.Header>Get started with Truffle</BSCard.Header>
              <BSCard.Block>
                <BSCard.Text>TODO</BSCard.Text>
              </BSCard.Block>
            </BSCard>
          </div>
          <div className='col-sm-6'>
            <BSCard>
              <BSCard.Header>Get started with Populus</BSCard.Header>
              <BSCard.Block>
                <SyntaxHighlighter language='bash' style={docco}>{POPULUS_CODE}</SyntaxHighlighter>
                <div className="text-center">
                  <a className="btn btn-success" target="_blank" href="http://populus.readthedocs.io/en/feat-v2/tutorial.html">Populus Documentation</a>
                </div>
              </BSCard.Block>
            </BSCard>
          </div>
        </div>
      </div>
    )
  },
}))
