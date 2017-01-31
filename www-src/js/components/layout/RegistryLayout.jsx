import React from 'react'
import { connect } from 'react-redux'
import HideIfNoWeb3 from '../common/HideIfNoWeb3'
import HideUntilIndexMetaLoaded from '../common/HideUntilIndexMetaLoaded'


function mapStateToProps(state) {
  return {}
}

export default HideIfNoWeb3(HideUntilIndexMetaLoaded(connect(mapStateToProps)(React.createClass({
  render() {
    return (
      <div id="registry-layout">
        {this.props.children}
      </div>
    )
  }
}))))
