import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import actions from '../../actions'
import BSCard from '../bootstrap/BSCard'
import BSBreadcrumb from '../bootstrap/BSBreadcrumb'
import LoadingSpinner from '../common/LoadingSpinner'
import DateTimeDisplay from '../common/DateTimeDisplay'
import HideUntilPackageLoaded from '../common/HideUntilPackageLoaded'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packageList = state.packageIndex.getIn([packageIndexAddress, 'packageData', 'packageList'])
  let packages = state.packageIndex.getIn([packageIndexAddress, 'packageData', 'packages'])
  return {
    packageIndexAddress: packageIndexAddress,
    packageList: packageList,
    packages: packages,
  }
}

export default connect(mapStateToProps)(React.createClass({
  renderTableRows() {
    if (this.props.packageList.size == 0) {
      return (
        <tr key={0}>
          <td colSpan="4">No Packages</td>
        </tr>
      )
    } else {
      return _.chain(this.props.packageList.size)
        .range()
        .map(function(packageIdx) {
          return <PackageRow packageIdx={packageIdx} key={packageIdx} />
        })
        .value()
    }
  },
  render() {
    return (
      <div className="container">
        <div className='row'>
          <div className='col-sm-12'>
            <BSBreadcrumb>
              <BSBreadcrumb.Crumb linkTo='/' crumbText='Home' />
              <BSBreadcrumb.Crumb linkTo='/registry' crumbText='Registry' />
              <BSBreadcrumb.Crumb crumbText="Package Index" />
            </BSBreadcrumb>
          </div>
        </div>
        <div className="row">
          <div className='col-sm-12'>
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
          </div>
        </div>
      </div>
    )
  },
}))


let PackageRow = connect(mapStateToProps)(React.createClass({
  componentWillMount() {
    if (!this.isPackageLoaded()) {
      this.props.dispatch(actions.loadPackageData(this.props.packageIndexAddress, this.getPackageName()))
    }
  },
  getPackageName() {
    return this.props.packageList.get(this.props.packageIdx)
  },
  isPackageLoaded() {
    let packageName = this.getPackageName()
    return _.every([
      this.props.packages.hasIn([packageName, 'meta', 'createdAt']),
      this.props.packages.hasIn([packageName, 'details', 'name']),
    ])
  },
  getPackageMeta() {
    return this.props.packages.getIn([this.getPackageName(), 'meta'])
  },
  getPackageDetails() {
    return this.props.packages.getIn([this.getPackageName(), 'details'])
  },
  render() {
    if (!this.isPackageLoaded()) {
      let packageName = this.getPackageName()
      return (
        <tr key={this.props.packageIdx}>
          <td>{this.props.packageIdx + 1}</td>
          <td><Link to={`/registry/packages/${this.props.packageIdx}`}>{packageName}</Link></td>
          <td><LoadingSpinner /></td>
          <td><LoadingSpinner /></td>
        </tr>
      )
    } else {
      let packageName = this.getPackageName()
      let packageMeta = this.getPackageMeta()
      let packageDetails = this.getPackageDetails()
      return (
        <tr key={this.props.packageIdx}>
          <td>{this.props.packageIdx + 1}</td>
          <td><Link to={`/registry/packages/${this.props.packageIdx}`}>{this.getPackageName()}</Link></td>
          <td>{packageDetails.get('numReleases')}</td>
          <td><DateTimeDisplay when={packageMeta.get('updatedAt')} /></td>
        </tr>
      )
    }
  }
}))
