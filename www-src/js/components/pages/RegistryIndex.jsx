import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSCard from '../bootstrap/BSCard'
import BSBreadcrumb from '../bootstrap/BSBreadcrumb'
import SyntaxHighlighter from "react-syntax-highlighter/dist/light"
import docco from 'react-syntax-highlighter/dist/styles/docco'; 

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS;
  return {
    packageIndexAddress: packageIndexAddress,
    numReleases: state.packageIndex.getIn([packageIndexAddress, 'numReleases']),
    numPackages: state.packageIndex.getIn([packageIndexAddress, 'numPackages']),
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
          <div className='col-sm-7'>
            <div className="jumbotron">
              <h2>The Ethereum Package Registry</h2>
              <p>The Ethereum Package Registry is a package index for Ethereum smart contract packages.  The registry is based on the <a href="https://github.com/ethereum/EIPs/issues/190">ERC190 Smart Contract Packaging Specification</a>.</p>
              <p>There are currently {this.props.numPackages} packages here with a total of {this.props.numReleases} releases.</p>
              <Link className="btn btn-primary pull-right" to="registry/packages">Browse Packages</Link>
            </div>
          </div>
          <div className='col-sm-5'>
            <BSCard>
              <BSCard.Header>Latest Releases</BSCard.Header>
              <BSCard.Block>
                <ul>
                  <li>TODO</li>
                </ul>
              </BSCard.Block>
            </BSCard>
          </div>
        </div>
        <div className='row'>
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
              </BSCard.Block>
            </BSCard>
          </div>
        </div>
      </div>
    )
  },
}))
