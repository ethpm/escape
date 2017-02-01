import React from 'react'
import { connect } from 'react-redux'
import HideIfNoWeb3 from '../common/HideIfNoWeb3'
import HideUntilPackageListLoaded from '../common/HideUntilPackageListLoaded'


function mapStateToProps(state) {
  return {}
}

export default HideIfNoWeb3(HideUntilPackageListLoaded(connect(mapStateToProps)(React.createClass({
  render() {
    return (
      <div>
        <div className="container">
          {this.props.children}
        </div>
      </div>
    )
  }
}))))
