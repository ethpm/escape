import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'
import HideUntilPackageMetaLoaded from './HideUntilPackageMetaLoaded'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packages = state.packageIndex.getIn([packageIndexAddress, 'packageData', 'packages'])
  return {
    _packageIndexAddress: packageIndexAddress,
    _packages: packages,
  }
}

export default function HideUntilPackageReleasesLoaded(WrappedComponent) {
  return HideUntilPackageMetaLoaded(connect(mapStateToProps)(React.createClass({
    arePackageReleasesLoaded() {
      return this.props._packages.getIn(
        [this.props.packageIdx, 'releaseData', 'isLoaded'],
        false,
      )
    },
    componentWillMount() {
      this.props.dispatch(actions.triggerAllPackageReleasesLoad(
        this.props._packageIndexAddress,
        this.props.packageIdx,
      ))
    },
    render() {
      if (this.arePackageReleasesLoaded()) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_packages')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package releases to load.</span>
      }
    }
  })))
}
