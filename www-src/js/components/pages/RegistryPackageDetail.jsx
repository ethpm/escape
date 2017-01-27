import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSCard from '../bootstrap/BSCard'
import HideUntilPackageMetaLoaded from '../common/HideUntilPackageMetaLoaded'
import HideUntilPackageReleasesLoaded from '../common/HideUntilPackageReleasesLoaded'
import DateTimeDisplay from '../common/DateTimeDisplay'
import EthereumAddress from '../common/EthereumAddress'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packages = state.packageIndex.getIn([packageIndexAddress, 'packageData', 'packages'])
  return {
    packageIndexAddress: packageIndexAddress,
    packages: packages,
  }
}

export default connect(mapStateToProps)(React.createClass({
  render() {
    return (
      <div>
        <PageInner packageIdx={this.props.params.packageIdx} />
        <ReleaseTable packageIdx={this.props.params.packageIdx} />
      </div>
    )
  },
}))


let PageInner = HideUntilPackageMetaLoaded(connect(mapStateToProps)(React.createClass({
  getPackageMeta() {
    return this.props.packages.getIn([this.props.packageIdx, 'meta'])
  },
  render() {
    let packageMeta = this.getPackageMeta()
    return (
      <div>
        <h1>{packageMeta.get('packageIdx')}: {packageMeta.get('name')}</h1>
        <ul>
          <li>Owner: <EthereumAddress address={packageMeta.get('owner')} imageSize={16} /></li>
          <li>Num Releases: {packageMeta.get('numReleases')}</li>
          <li>Created: <DateTimeDisplay when={packageMeta.get('createdAt')} /></li>
          <li>Updated: <DateTimeDisplay when={packageMeta.get('updatedAt')} /></li>
        </ul>
      </div>
    )
  }
})))


let ReleaseTable = HideUntilPackageReleasesLoaded(connect(mapStateToProps)(React.createClass({
  getReleases() {
    return this.props.packages.getIn(
      [this.props.packageIdx, 'releaseData', 'releases']
    )
  },
  renderTableRows() {
    let releases = this.getReleases()
    if (releases.size == 0) {
      return (
        <tr>
          <td colSpan="8">No Releases</td>
        </tr>
      )
    } else {
      return releases.map(function(releaseDetails, idx) {
        if (releaseDetails === undefined || !releaseDetails.getIn(['meta', 'isLoaded'])) {
          return (
            <tr key={idx}>
              <td colSpan="8">Loading Release Details</td>
            </tr>
          )
        }
        let releaseMeta = releaseDetails.get('meta')
        let releaseData = releaseDetails.get('data')
        return (
          <tr key={idx}>
            <td>{releaseMeta.get('releaseIdx') + 1}</td>
            <td>{releaseData.get('major')}</td>
            <td>{releaseData.get('minor')}</td>
            <td>{releaseData.get('patch')}</td>
            <td>{releaseData.get('preRelease')}</td>
            <td>{releaseData.get('build')}</td>
            <td><DateTimeDisplay when={releaseMeta.get('createdAt')} /></td>
            <td>{releaseData.get('releaseLockfileURI')}</td>
          </tr>
        )
      }).toJS()
    }
  },
  render() {
    return (
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Major</th>
            <th>Minor</th>
            <th>Patch</th>
            <th>Pre Release</th>
            <th>Build</th>
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
