import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'
import HideUntilIndexDataLoaded from './HideUntilIndexDataLoaded'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packagesList = state.packageIndex.getIn([packageIndexAddress, 'packageData', 'packageList'])
  return {
    _packageIndexAddress: packageIndexAddress,
    _packageList: packageList,
  }
}

export default function HideUntilPackageNameLoaded(WrappedComponent) {
  return HideUntilIndexDataLoaded(connect(mapStateToProps)(React.createClass({
    isPackageNameLoaded() {
      return this.props._packageList.has(this.props.packageIdx)
    },
    componentWillMount() {
      if (!this.isPackageNameLoaded()) {
        this.props.dispatch(actions.loadPackageName(
          this.props._packageIndexAddress,
          this.props.packageIdx,
        ))
      }
    },
    render() {
      if (this.isPackageMetaLoaded()) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_packageList')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package name to load.</span>
      }
    }
  })))
}
