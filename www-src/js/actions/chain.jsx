import TYPES from './types'
import { getBlock } from '../services/web3'


const MAINNET_BLOCK_0_HASH = '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'
const ROPSTEN_BLOCK_0_HASH = '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d'


export function loadChainMetaData() {
  return function(dispatch, getState) {
    dispatch(resetChainMetaData())
    return getBlock('earliest').then(function(block) {
      dispatch(setChainMetaData({
        isLoaded: true,
        isMainnet: block.hash === MAINNET_BLOCK_0_HASH,
        isRopsten: block.hash === ROPSTEN_BLOCK_0_HASH,
        genesisBlockHash: block.hash,
      }))
    }, function(error) {
      console.error(error)
    })
  }
}

export function resetChainMetaData() {
  return {
    type: TYPES.SET_CHAIN_METADATA,
    metaData: {
      genesisBlockHash: null,
      isLoaded: false,
      isMainnet: null,
      isRopsten: null,
    }
  }
}

export function setChainMetaData(metaData) {
  return {
    type: TYPES.SET_CHAIN_METADATA,
    metaData: metaData,
  }
}
