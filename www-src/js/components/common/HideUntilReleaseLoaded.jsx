import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'
import HideUntilIndexDataLoaded from './HideUntilIndexDataLoaded'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let releases = state.packageIndex.getIn([packageIndexAddress, 'releaseData', 'releases'])
  return {
    _packageIndexAddress: packageIndexAddress,
    _releases: releases,
  }
}

export default function HideUntilReleaseLoaded(WrappedComponent) {
  return HideUntilIndexDataLoaded(connect(mapStateToProps)(React.createClass({
    isReleaseLoaded() {
      return _.every([
        this.props._releases.hasIn([this.props.releaseHash, 'meta', 'createdAt']),
        this.props._releases.hasIn([this.props.releaseHash, 'meta', 'updatedAt']),
        this.props._releases.hasIn([this.props.releaseHash, 'details', 'major']),
        this.props._releases.hasIn([this.props.releaseHash, 'details', 'minor']),
        this.props._releases.hasIn([this.props.releaseHash, 'details', 'patch']),
        this.props._releases.hasIn([this.props.releaseHash, 'details', 'preRelease']),
        this.props._releases.hasIn([this.props.releaseHash, 'details', 'build']),
        this.props._releases.hasIn([this.props.releaseHash, 'details', 'releaseLockfileURI']),
      ])
    },
    componentWillMount() {
      if (!this.isReleaseLoaded()) {
        this.props.dispatch(actions.loadReleaseData(
          this.props._packageIndexAddress,
          this.props.releaseHash,
        ))
      }
    },
    render() {
      if (this.isReleaseLoaded()) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_releases')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for release data to load.</span>
      }
    }
  })))
}
