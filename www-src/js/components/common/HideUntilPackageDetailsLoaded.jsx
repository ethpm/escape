import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'
import HideUntilPackageDataInitialized from './HideUntilPackageDataInitialized'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packageData = _.get(state.packageIndex, packageIndexAddress, {}).packageData
  return {
    _packageIndexAddress: packageIndexAddress,
    _packageData: packageData,
  }
}

export default function HideUntilPackageDetailsLoaded(WrappedComponent) {
  return HideUntilPackageDataInitialized(connect(mapStateToProps)(React.createClass({
    isPackageLoaded() {
      // TODO: it feels weird for this to use `this.props.packageIdx since it's coming from the router and this is supposed to be re-usable.
      let packageDetails = _.get(this.props._packageData.packages, this.props.packageIdx)
      return packageDetails.meta.isLoaded
    },
    componentWillMount() {
      this.props.dispatch(actions.loadPackageMeta(this.props._packageIndexAddress, this.props.packageIdx))
    },
    render() {
      if (this.isPackageLoaded()) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_packageData')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package data to load.</span>
      }
    }
  })))
}
