import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'
import HideUntilPackageIndexInitialized from './HideUntilPackageIndexInitialized'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let isInitialized = state.packageIndex.getIn([
    packageIndexAddress, 'packageData', 'isInitialized',
  ], false)
  return {
    _packageIndexAddress: packageIndexAddress,
    _isPackageDataInitialized: isInitialized,
  }
}

export default function HideUntilPackageDataInitialized(WrappedComponent) {
  return HideUntilPackageIndexInitialized(connect(mapStateToProps)(React.createClass({
    componentWillMount() {
      this.props.dispatch(actions.initializePackageData(this.props._packageIndexAddress))
    },
    render() {
      if (this.props._isPackageDataInitialized) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_isPackageDataInitialized')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package data to load.</span>
      }
    }
  })))
}
