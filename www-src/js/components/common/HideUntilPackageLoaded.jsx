import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'
import HideUntilPackageNameLoaded from './HideUntilPackageNameLoaded'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packagesList = state.packageIndex.getIn(
    [packageIndexAddress, 'packageData', 'packageList']
  )
  let packages = state.packageIndex.getIn([packageIndexAddress, 'packageData', 'packages'])
  return {
    _packageIndexAddress: packageIndexAddress,
    _packageList: packageList,
    _packages: packages,
  }
}

export default function HideUntilPackageLoaded(WrappedComponent) {
  return HideUntilPackageNameLoaded(connect(mapStateToProps)(React.createClass({
    getPackageName() {
      return this.props.packageList.get(this.props.packageIdx)
    },
    isPackageLoaded() {
      let packageName = this.getPackageName()
      return _.every([
        this.props._packages.hasIn([packageName, 'meta', 'createdAt']),
        this.props._packages.hasIn([packageName, 'details', 'name']),
      ])
    },
    componentWillMount() {
      if (!this.isPackageLoaded()) {
        this.props.dispatch(actions.loadPackageData(
          this.props._packageIndexAddress,
          this.getPackageName(),
        ))
      }
    },
    render() {
      if (this.isPackageMetaLoaded()) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_packages', '_packageList')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package data to load.</span>
      }
    }
  })))
}
