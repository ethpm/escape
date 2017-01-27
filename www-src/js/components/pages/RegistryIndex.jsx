import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSCard from '../bootstrap/BSCard'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS;
  return {
    packageIndexAddress: packageIndexAddress,
    numReleases: state.packageIndex.getIn([packageIndexAddress, 'numReleases']),
    numPackages: state.packageIndex.getIn([packageIndexAddress, 'numPackages']),
  }
}

export default connect(mapStateToProps)(React.createClass({
  render() {
    return (
      <div className='row'>
        <div className='col-sm-7'>
          <div className='container'>
            <div className='row'>
              <div className='col-sm-12'>
                <BSCard>
                  <BSCard.Header>
                    Package Registry
                  </BSCard.Header>
                  <BSCard.Block>
                    <BSCard.Text>
                      The package index contains {this.props.numReleases} releases from {this.props.numPackages} packages.
                      <Link className='nav-item nav-link' to='/registry/packages'>
                        Browse Packages
                      </Link>
                    </BSCard.Text>
                  </BSCard.Block>
                </BSCard>
              </div>
            </div>
          </div>
        </div>
        <div className='col-sm-5'>
          <BSCard>
            <BSCard.Header>Latest Releases</BSCard.Header>
            <BSCard.Block>
              <BSCard.Text>Stub</BSCard.Text>
            </BSCard.Block>
          </BSCard>
        </div>
      </div>
    )
  },
}))
