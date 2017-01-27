import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'
import HideUntilPackageDataInitialized from './HideUntilPackageDataInitialized'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packageIndexData = _.get(state.packageIndex, packageIndexAddress, {})
  return {
    _packageIndexAddress: packageIndexAddress,
    _packageIndexData: packageIndexData,
  }
}

export default function HideUntilPackageDetailsLoaded(WrappedComponent) {
  return HideUntilPackageDataInitialized(connect(mapStateToProps)(React.createClass({
    arePackageDetailsLoaded() {
      // TODO: it feels weird for this to use `this.props.packageIdx since it's coming from the router and this is supposed to be re-usable.
      let packageDetails = _.get(this.props.packageIndexData, this.props.packageIdx)
      return !_.isEmpty(packageDetails.isLoaded)
    },
    componentWillMount() {
      this.props.dispatch(actions.loadPackageDetails(this.props._packageIndexAddress, this.props.packageIdx))
    },
    render() {
      if (this.arePackageDetailsLoaded()) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_packageIndexData')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package index to load.</span>
      }
    }
  })))
}
