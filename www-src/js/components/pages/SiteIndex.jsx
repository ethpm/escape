import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSCard from '../bootstrap/BSCard'
import FAIcon from '../common/FAIcon'
import layoutStyles from '../../../css/layout.css'

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps)(React.createClass({
  render() {
    return (
      <div id="landing-page">
        <div className='container'>
          <div className='row'>
            <div id="landing-page-top" className='col-sm-7 offset-sm-5'>

              <div id="landing-page-top-title" className="card card-inverse">
                <div className="card-block">
                  <h1 className="card-title">The Ethereum Package Registry</h1>
                  <p className="card-text">A package index for Ethereum smart contract packages.</p>
                  <Link className="btn btn-primary pull-right" to="registry"><FAIcon icon="book" /> Registry</Link>
                </div>
              </div>
            </div>
            <div className='col-sm-5'>
              <BSCard>
                <BSCard.Header>Another Header</BSCard.Header>
                <BSCard.Block>
                  <BSCard.Text>Stub</BSCard.Text>
                  <ol>
                    <li>Item 1</li>
                    <li>Item 2</li>
                  </ol>
                  <BSCard.Text>Another Stub</BSCard.Text>
                  <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                    <li>Item 3</li>
                  </ul>
                </BSCard.Block>
              </BSCard>
            </div>
          </div>
        </div>
      </div>
    )
  },
}))
