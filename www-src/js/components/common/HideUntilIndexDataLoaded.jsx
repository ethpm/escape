import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'
import HideUntilIndexMetaLoaded from './HideUntilIndexMetaLoaded'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let isLoaded = state.packageIndex.getIn([
    packageIndexAddress, 'packageData', 'isLoaded',
  ])
  return {
    _packageIndexAddress: packageIndexAddress,
    _isIndexDataLoaded: isLoaded,
  }
}

export default function HideUntilIndexDataLoaded(WrappedComponent) {
  return HideUntilIndexMetaLoaded(connect(mapStateToProps)(React.createClass({
    componentWillMount() {
      this.props.dispatch(actions.triggerIndexDataLoad(this.props._packageIndexAddress))
    },
    render() {
      if (this.props._isIndexDataLoaded) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_isIndexDataLoaded')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package index data to load.</span>
      }
    }
  })))
}
