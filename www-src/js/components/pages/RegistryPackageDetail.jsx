import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSCard from '../bootstrap/BSCard'
import HideUntilPackageMetaLoaded from '../common/HideUntilPackageMetaLoaded'

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
      </div>
    )
  }
})))
