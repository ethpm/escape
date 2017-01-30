import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSCard from '../bootstrap/BSCard'
import DateTimeDisplay from '../common/DateTimeDisplay'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packages = state.packageIndex.getIn([packageIndexAddress, 'packageData', 'packages'])
  return {
    packageIndexAddress: packageIndexAddress,
    packages: packages,
  }
}

export default connect(mapStateToProps)(React.createClass({
  renderTableRows() {
    if (this.props.packages.size == 0) {
      return (
        <tr>
          <td colSpan="3">No Packages</td>
        </tr>
      )
    } else {
      return this.props.packages.map(function(packageData, idx) {
        if (packageData === undefined || !packageData.getIn(['meta', 'isLoaded'])) {
          return (
            <tr key={idx}>
              <td colSpan="3">Loading Package Data</td>
            </tr>
          )
        }
        let packageMeta = packageData.get('meta')
        return (
          <tr key={idx}>
            <td>{packageMeta.get('packageIdx') + 1}</td>
            <td><Link to={`/registry/packages/${packageMeta.get('packageIdx')}`}>{packageMeta.get('name')}</Link></td>
            <td>{packageMeta.get('numReleases')}</td>
            <td><DateTimeDisplay when={packageMeta.get('updatedAt')} /></td>
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
            <th>Package Name</th>
            <th># Releases</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {this.renderTableRows()}
        </tbody>
      </table>
    )
  },
}))
