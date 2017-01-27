import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSCard from '../bootstrap/BSCard'
import HideUntilPackageDetailsLoaded from '../common/HideUntilPackageDetailsLoaded'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packageData = state.packageIndex[packageIndexAddress].packageData
  return {
    packageIndexAddress: packageIndexAddress,
    packageData: packageData,
  }
}

export default connect(mapStateToProps)(React.createClass({
  render() {
    return (
      <PageInner packageIdx={this.props.packageIdx} />
    )
  },
}))


let PageInner = HideUntilPackageDetailsLoaded(connect(mapStateToProps)(React.createClass({
  getPackageDetails() {
    return this.props.packageData[this.props.packageIdx]
  },
  render() {
    let packageDetails = this.getPackageDetails()
    return (
      <div>
        <h1>{packageDetails.name}</h1>
      </div>
    )
  }
})))
