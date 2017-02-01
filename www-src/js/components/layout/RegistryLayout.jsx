import React from 'react'
import { connect } from 'react-redux'
import HideIfNoWeb3 from '../common/HideIfNoWeb3'
import HideUntilIndexDataLoaded from '../common/HideUntilIndexDataLoaded'


function mapStateToProps(state) {
  return {}
}

export default HideIfNoWeb3(HideUntilIndexDataLoaded(connect(mapStateToProps)(React.createClass({
  render() {
    return (
      <div id="registry-layout">
        {this.props.children}
      </div>
    )
  }
}))))
