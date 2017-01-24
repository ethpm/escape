import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import BSCard from '../bootstrap/BSCard'
import HideIfNoWeb3 from '../common/HideIfNoWeb3'

function mapStateToProps(state) {
  return {}
}

export default HideIfNoWeb3(connect(mapStateToProps)(React.createClass({
  render() {
    return (
      <div className='row'>
        <div className='col-sm-7'>
          <div className='container'>
            <div className='row'>
              <div className='col-sm-12'>
                <BSCard>
                  <BSCard.Header>
                    Ethereum Smart Contract and Package Index
                    <Link className='nav-item nav-link' to='/registry'>
                      Browse Index
                    </Link>
                  </BSCard.Header>
                  <BSCard.Block>
                    <BSCard.Text>Stub</BSCard.Text>
                    <BSCard.Text>Stub</BSCard.Text>
                  </BSCard.Block>
                </BSCard>
              </div>
              <div className='col-sm-12'>
                <BSCard>
                  <BSCard.Header>
                    Another Header
                  </BSCard.Header>
                  <BSCard.Block>
                    <BSCard.Text>Stub</BSCard.Text>
                  </BSCard.Block>
                </BSCard>
              </div>
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
    )
  },
})))
