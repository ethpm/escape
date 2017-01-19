import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

import '../../../css/layout'
import FAIcon from '../common/FAIcon'
import Web3StatusIcon from '../common/Web3StatusIcon'

function mapStateToProps(state) {
  return {}
}

let TopNavigation = connect(mapStateToProps)(React.createClass({
  render() {
    return (
      <nav id='top-nav' className='navbar navbar-dark bg-inverse'>
        <Link className='navbar-brand' to='/'>Escape</Link>
        <div className="pull-xs-right">
          <ul className="nav navbar-nav">
            <li className="nav-item">
              <Link className='nav-link' to='/configure/web3'>
                <Web3StatusIcon />
              </Link>
            </li>
            <li className="nav-item">
              <Link className='nav-link' to='/configure'><FAIcon icon="gear" /> Config</Link>
            </li>
          </ul>
        </div>
      </nav>
    )
  },
}))

export default connect(mapStateToProps)(React.createClass({
  render() {
    return (
      <div className="container">
        <TopNavigation />
        {this.props.children}
      </div>
    )
  }
}))
