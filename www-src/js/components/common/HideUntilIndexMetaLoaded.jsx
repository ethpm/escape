import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let isLoaded = state.packageIndex.getIn([packageIndexAddress, 'isLoaded'], false)
  return {
    _packageIndexAddress: packageIndexAddress,
    _isIndexMetaLoaded: isLoaded,
  }
}

export default function HideUntilIndexMetaLoaded(WrappedComponent) {
  return connect(mapStateToProps)(React.createClass({
    componentWillMount() {
      this.props.dispatch(actions.triggerIndexMetaLoad(this.props._packageIndexAddress))
    },
    render() {
      if (this.props._isIndexMetaLoaded) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_isIndexMetaLoaded')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package index metadata to load.</span>
      }
    }
  }))
}
