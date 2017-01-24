import React from 'react'
import { connect } from 'react-redux'
import HideIfNoWeb3 from '../common/HideIfNoWeb3'
import HideUntilPackageIndexInitialized from '../common/HideUntilPackageIndexInitialized'


function mapStateToProps(state) {
  return {}
}

export default HideIfNoWeb3(HideUntilPackageIndexInitialized(connect(mapStateToProps)(React.createClass({
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
