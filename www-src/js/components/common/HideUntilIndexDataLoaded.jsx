import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'
import HideIfNoWeb3 from '../common/HideIfNoWeb3'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let isLoaded = _.every([
    state.packageIndex.has(packageIndexAddress),
    state.packageIndex.hasIn([packageIndexAddress, 'packageData', 'meta', 'numPackages']),
    state.packageIndex.hasIn([packageIndexAddress, 'releaseData', 'meta', 'totalNumReleases']),
  ])
  return {
    _packageIndexAddress: packageIndexAddress,
    _isLoaded: isLoaded,
  }
}

export default function HideUntilIndexDataLoaded(WrappedComponent) {
  return HideIfNoWeb3(connect(mapStateToProps)(React.createClass({
    componentWillMount() {
      if (!this.props._isLoaded) {
        this.props.dispatch(actions.loadIndexData(this.props._packageIndexAddress))
      }
    },
    render() {
      if (this.props._isLoaded) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_isLoaded')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package index data to load.</span>
      }
    }
  })))
}
