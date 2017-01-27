import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSCard from '../bootstrap/BSCard'
import HideUntilPackageMetaLoaded from '../common/HideUntilPackageMetaLoaded'
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
      <PageInner packageIdx={this.props.params.packageIdx} />
    )
  },
}))


let PageInner = HideUntilPackageMetaLoaded(connect(mapStateToProps)(React.createClass({
  getPackage() {
    return this.props.packages.get(this.props.packageIdx)
  },
  getPackageMeta() {
    return this.getPackage().get('meta')
  },
  render() {
    let packageMeta = this.getPackageMeta()
    return (
      <div>
        <h1>{packageMeta.get('idx')}: {packageMeta.get('name')}</h1>
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
