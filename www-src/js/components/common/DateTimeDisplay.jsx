import React from 'react'
import LoadingSpinner from './LoadingSpinner'


export default React.createClass({
  render() {
    if (this.props.when === undefined) {
      return <LoadingSpinner />
    } else {
      return <span>{this.props.when.toString()}</span>
    }
  }
});
