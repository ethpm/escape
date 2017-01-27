import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'
import HideUntilPackageReleasesLoaded from './HideUntilPackageReleasesLoaded'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packages = state.packageIndex.getIn([packageIndexAddress, 'packageData', 'packages'])
  return {
    _packageIndexAddress: packageIndexAddress,
    _packages: packages,
  }
}

export default function HideUntilReleasetaLoaded(WrappedComponent) {
  return HideUntilPackageReleasesLoaded(connect(mapStateToProps)(React.createClass({
    isReleasetaLoaded() {
      return this.props._packages.getIn(
        [
          this.props.packageIdx,
          'releaseData', 'releases',
          this.props.releaseIdx,
          'meta', 'isLoaded',
        ],
        false,
      )
    },
    getReleaseHash() {
      return this.props._packages.getIn(
        [
          this.props.packageIdx,
          'releaseData', 'releases',
          this.props.releaseIdx,
          'meta', 'releaseHash',
        ],
      )
    },
    componentWillMount() {
      this.props.dispatch(actions.triggerReleaseLoad(
        this.props._packageIndexAddress,
        this.props.packageIdx,
        this.props.releaseIdx,
      ))
    },
    render() {
      if (this.isReleasetaLoaded()) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_packages')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package data to load.</span>
      }
    }
  })))
}
