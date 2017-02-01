import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSCard from '../bootstrap/BSCard'
import FAIcon from '../common/FAIcon'

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps)(React.createClass({
  render() {
    return (
      <div id="documentation-integration-guide">
        <div className='container'>
          <div className='row'>
            <div className='col-sm-12'>
              <h1>Integration Guide</h1>
              <p>TODO</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
}))
