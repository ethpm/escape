import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packageIndexData = _.get(state.packageIndex, packageIndexAddress, {})
  let isInitialized = _.get(packageIndexData, 'isInitialized')
  return {
    _packageIndexAddress: packageIndexAddress,
    _isPackageIndexInitialized: isInitialized,
  }
}

export default function HideUntilPackageIndexInitialized(WrappedComponent) {
  return connect(mapStateToProps)(React.createClass({
    componentWillMount() {
      this.props.dispatch(actions.initializeIndex(this.props._packageIndexAddress))
    },
    render() {
      if (this.props._isPackageIndexInitialized) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_isPackageIndexInitialized')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package index to load.</span>
      }
    }
  }))
}
