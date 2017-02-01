import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LoadingSpinner from './LoadingSpinner'
import HideUntilIndexDataLoaded from './HideUntilIndexDataLoaded'

function mapStateToProps(state) {
  let packageIndexAddress = state.config.PACKAGE_INDEX_ADDRESS
  let packageList = state.packageIndex.getIn([packageIndexAddress, 'packageData', 'packageList'])
  return {
    _packageIndexAddress: packageIndexAddress,
    _packageList: packageList,
  }
}

export default function HideUntilPackageListLoaded(WrappedComponent) {
  return HideUntilIndexDataLoaded(connect(mapStateToProps)(React.createClass({
    isPackageListLoaded() {
      return _.every(this.props._packageList.toJS())
    },
    componentWillMount() {
      if (!this.isPackageListLoaded()) {
        this.props.dispatch(actions.loadPackageList(
          this.props._packageIndexAddress,
          this.props.packageIdx,
        ))
      }
    },
    render() {
      if (this.isPackageListLoaded()) {
        return (
          <WrappedComponent {..._.omit(this.props, '_packageIndexAddress', '_packageList')} />
        )
      } else {
        return <span><LoadingSpinner /> Waiting for package names to load.</span>
      }
    }
  })))
}
