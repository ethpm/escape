import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'
import HideUntilIndexDataLoaded from './HideUntilIndexDataLoaded'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packages = state.packageIndex.getIn([packageIndexAddress, 'packageData', 'packages'])
  return {
    _packageIndexAddress: packageIndexAddress,
    _packages: packages,
  }
}

export default function HideUntilPackageMetaLoaded(WrappedComponent) {
  return HideUntilIndexDataLoaded(connect(mapStateToProps)(React.createClass({
    isPackageMetaLoaded() {
      return this.props._packages.getIn([this.props.packageIdx, 'meta', 'isLoaded'], false)
    },
    componentWillMount() {
      this.props.dispatch(actions.triggerPackageMetaLoad(
        this.props._packageIndexAddress,
        this.props.packageIdx,
      ))
    },
    render() {
      if (this.isPackageMetaLoaded()) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_packages')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package meta data to load.</span>
      }
    }
  })))
}
