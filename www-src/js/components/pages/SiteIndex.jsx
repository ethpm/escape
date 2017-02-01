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
            <div id="landing-page-top" className='col-sm-8 offset-sm-2'>

              <div id="landing-page-top-title" className="card card-inverse">
                <div className="card-block">
                  <h1 className="card-title">The Ethereum Package Registry</h1>
                  <p className="card-text">A package index for Ethereum smart contract packages.</p>
                  <Link className="btn btn-primary pull-right" to="registry"><FAIcon icon="book" /> Registry</Link>
                </div>
              </div>
            </div>
            <div id="landing-page-letter" className='col-sm-8 offset-sm-2'>
              <BSCard>
                <BSCard.Block>
                  <BSCard.Text>Dear Ethereum,</BSCard.Text>

                  <BSCard.Text>We need to have a talk.  You haven't been the easiest platform to work with.  Don't get me wrong, you have some great qualities that we love but it's time you grew up a bit and started acting a bit more... <em>mature</em>.</BSCard.Text>

                  <BSCard.Text>Since we care about you and really want you to succeed we made you something that should help.  It's a <strong>package index</strong>.</BSCard.Text>

                  <BSCard.Text>I know that new things can be a little scary but we're sure that once you try it you'll love it.  Developers are going to want to play with you more.  Their bosses may even stop seeing you as the dangerous kid teaching all their devs bad software habits like copy/pasting code.</BSCard.Text>

                  <BSCard.Text>Please give it a try.  We really do want the best for you.</BSCard.Text>

                  <BSCard.Text><em>Piper &amp; Tim</em></BSCard.Text>
                </BSCard.Block>
              </BSCard>
            </div>
          </div>
        </div>
      </div>
    )
  },
}))
