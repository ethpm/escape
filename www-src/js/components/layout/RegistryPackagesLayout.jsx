import React from 'react'
import { connect } from 'react-redux'
import HideIfNoWeb3 from '../common/HideIfNoWeb3'
import HideUntilPackageDataInitialized from '../common/HideUntilPackageDataInitialized'


function mapStateToProps(state) {
  return {}
}

export default HideIfNoWeb3(HideUntilPackageDataInitialized(connect(mapStateToProps)(React.createClass({
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
