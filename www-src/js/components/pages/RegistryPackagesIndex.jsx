import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSCard from '../bootstrap/BSCard'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packageData = state.packageIndex[packageIndexAddress].packageData
  return {
    packageIndexAddress: packageIndexAddress,
    packageData: packageData,
  }
}

export default connect(mapStateToProps)(React.createClass({
  renderTableRows() {
    if (_.isEmpty(this.props.packageData.packages) && !this.props.packageData.isInitialized) {
      return (
        <tr>
          <td colSpan="2">No Packages</td>
        </tr>
      )
    } else if (!this.props.packageData.isInitialized) {
      return (
        <tr>
          <td colSpan="2">Loading Package Data</td>
        </tr>
      )
    } else {
      return _.map(this.props.packageData.packages, function(packageData, idx) {
        if (packageData === undefined || !packageData.isInitialized) {
          return (
            <tr>
              <td colSpan="2">Loading Package Data</td>
            </tr>
          )
        }
        return (
          <tr key={idx}>
            <td>{idx + 1}</td>
            <td>{packageData.name}</td>
          </tr>
        )
      })
    }
  },
  render() {
    return (
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Package Name</th>
          </tr>
        </thead>
        <tbody>
          {this.renderTableRows()}
        </tbody>
      </table>
    )
  },
}))
