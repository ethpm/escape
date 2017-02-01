import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSBreadcrumb from '../bootstrap/BSBreadcrumb'
import DateTimeDisplay from '../common/DateTimeDisplay'
import EthereumAddress from '../common/EthereumAddress'
import SemVersionNumber from '../common/SemVersionNumber'
import IPFSGatewayURI from '../common/IPFSGatewayURI'
import HideUntilPackageLoaded from '../common/HideUntilPackageLoaded'
import HideUntilReleaseLoaded from '../common/HideUntilReleaseLoaded'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packages = state.packageIndex.getIn([packageIndexAddress, 'packageData', 'packages'])
  let packageList = state.packageIndex.getIn([packageIndexAddress, 'packageData', 'packageList'])
  return {
    packageIndexAddress: packageIndexAddress,
    packages: packages,
    packageList: packageList,
  }
}

export default connect(mapStateToProps)(React.createClass({
  getPackageName() {
    return this.props.packageList.get(this.props.params.packageIdx)
  },
  render() {
    return (
      <div className="container">
        <div className='row'>
          <div className='col-sm-12'>
            <BSBreadcrumb>
              <BSBreadcrumb.Crumb linkTo='/' crumbText='Home' />
              <BSBreadcrumb.Crumb linkTo='/registry' crumbText='Registry' />
              <BSBreadcrumb.Crumb linkTo='/registry/packages' crumbText="Package Index" />
              <BSBreadcrumb.Crumb crumbText={`${this.getPackageName()} Package`} />
            </BSBreadcrumb>
          </div>
        </div>
        <div className="row">
          <div className='col-sm-12'>
            <PageInner packageIdx={this.props.params.packageIdx} />
            <ReleaseTable packageIdx={this.props.params.packageIdx} />
          </div>
        </div>
      </div>
    )
  },
}))


let PageInner = HideUntilPackageLoaded(connect(mapStateToProps)(React.createClass({
  getPackageName() {
    return this.props.packageList.get(this.props.packageIdx)
  },
  getPackageMeta() {
    return this.props.packages.getIn([this.getPackageName(), 'meta'])
  },
  getPackageDetails() {
    return this.props.packages.getIn([this.getPackageName(), 'details'])
  },
  render() {
    let packageMeta = this.getPackageMeta()
    let packageDetails = this.getPackageDetails()
    return (
      <div>
        <h1>{this.props.packageIdx}: {packageDetails.get('name')}</h1>
        <ul>
          <li>Owner: <EthereumAddress address={packageDetails.get('owner')} imageSize={16} /></li>
          <li>Num Releases: {packageDetails.get('numReleases')}</li>
          <li>Created: <DateTimeDisplay when={packageMeta.get('createdAt')} /></li>
          <li>Updated: <DateTimeDisplay when={packageMeta.get('updatedAt')} /></li>
        </ul>
      </div>
    )
  }
})))


let ReleaseTable = HideUntilPackageLoaded(connect(mapStateToProps)(React.createClass({
  getPackageName() {
    return this.props.packageList.get(this.props.packageIdx)
  },
  getPackageReleaseHashes() {
    return this.props.packages.getIn([this.getPackageName(), 'releases'])
  },
  renderTableRows() {
    let releases = this.getPackageReleaseHashes()
    if (releases.size == 0) {
      return (
        <tr>
          <td colSpan="4">No Releases</td>
        </tr>
      )
    } else {
      return releases.map(function(releaseHash, idx) {
        return <ReleaseRow packageReleaseIdx={idx} releaseHash={releaseHash} key={idx} />
      })
    }
  },
  render() {
    return (
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Version</th>
            <th>Created</th>
            <th>Lockfile</th>
          </tr>
        </thead>
        <tbody>
          {this.renderTableRows()}
        </tbody>
      </table>
    )
  }
})))


function mapStateToReleaseProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let releases = state.packageIndex.getIn([packageIndexAddress, 'releaseData', 'releases'])
  return {
    packageIndexAddress: packageIndexAddress,
    releases: releases,
  }
}


let ReleaseRow = HideUntilReleaseLoaded(connect(mapStateToReleaseProps)(React.createClass({
  getReleaseMeta() {
    return this.props.releases.getIn([this.props.releaseHash, 'meta'])
  },
  getReleaseDetails() {
    return this.props.releases.getIn([this.props.releaseHash, 'details'])
  },
  render() {
    let releaseMeta = this.getReleaseMeta()
    let releaseDetails = this.getReleaseDetails()
    let versionData = {
      major: releaseDetails.get('major'),
      minor: releaseDetails.get('minor'),
      patch: releaseDetails.get('patch'),
      preRelease: releaseDetails.get('preRelease'),
      build: releaseDetails.get('build'),
    }
    return (
      <tr>
        <td>{this.props.packageReleaseIdx + 1}</td>
        <td><SemVersionNumber {...versionData} /></td>
        <td><DateTimeDisplay when={releaseMeta.get('createdAt')} /></td>
        <td><IPFSGatewayURI ipfsURI={releaseDetails.get('releaseLockfileURI')} /></td>
      </tr>
    )
  }
})))
