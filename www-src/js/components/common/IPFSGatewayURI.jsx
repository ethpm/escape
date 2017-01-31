import React from 'react'


export default React.createClass({
  getIPFSGatewayURI() {
    let url = new URL(this.props.ipfsURI)
    let [, ipfsHash] = this.props.ipfsURI.split('://')
    return `https://gateway.ipfs.io/ipfs/${ipfsHash}`
  },
  render() {
    // TODO: is this dangerous? user generated content...
    return <a href={this.getIPFSGatewayURI()}>{this.props.ipfsURI}</a>
  }
});
