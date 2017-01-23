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
                    Package Registry
                  </BSCard.Header>
                  <BSCard.Block>
                    <BSCard.Text>
                      The package index contains TODO releases from  TODO packages.
                    </BSCard.Text>
                  </BSCard.Block>
                </BSCard>
              </div>
            </div>
          </div>
        </div>
        <div className='col-sm-5'>
          <BSCard>
            <BSCard.Header>Latest Releases</BSCard.Header>
            <BSCard.Block>
              <BSCard.Text>Stub</BSCard.Text>
            </BSCard.Block>
          </BSCard>
        </div>
      </div>
    )
  },
})))
