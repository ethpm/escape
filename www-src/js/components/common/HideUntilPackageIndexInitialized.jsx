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
    _isInitialized: isInitialized,
  }
}

export default function HideUntilPackageIndexInitialized(WrappedComponent) {
  return connect(mapStateToProps)(React.createClass({
    componentWillMount() {
      if (!this.props._isInitialized) {
        this.props.dispatch(actions.initializePackageIndex(this.props._packageIndexAddress))
      }
    },
    render() {
      if (this.props._isInitialized) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_packageIndexData')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package index to load.</span>
      }
    }
  }))
}
