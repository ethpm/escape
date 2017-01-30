import _ from 'lodash'
import React from 'react'


export default React.createClass({
  defaultProps: {
    major: 0,
    minor: 0,
    patch: 0,
    preRelease: null,
    build: null,
  },
  versionStringDisplay() {
    let versionString = [this.props.major, this.props.minor, this.props.patch].join('.')
    if (!_.isEmpty(this.props.preRelease)) {
      versionString += '-' + this.props.preRelease
    }
    if (!_.isEmpty(this.props.build)) {
      versionString += '+' + this.props.build
    }
    return versionString
  },
  render() {
    return <span>{this.versionStringDisplay()}</span>
  }
});
