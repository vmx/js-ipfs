'use strict'

const IPFS = require('ipfs')


const configA = {
  "Addresses": {
    "API": "/ip4/127.0.0.1/tcp/5012",
    "Gateway": "/ip4/127.0.0.1/tcp/9091",
    "Swarm": [
      "/ip4/0.0.0.0/tcp/4012",
      "/ip4/127.0.0.1/tcp/4013/ws"
    ]
  },
  "Bootstrap": []
}
const peerA = new IPFS({
  repo: '/tmp/peera',
  config: configA,
  init: {
    emptyRepo: true
  }
})
peerA.on('ready', () => {
  console.log('peerA ready')
})

const configB = {
  "Addresses": {
    "API": "/ip4/127.0.0.1/tcp/5022",
    "Gateway": "/ip4/127.0.0.1/tcp/9092",
    "Swarm": [
      "/ip4/0.0.0.0/tcp/4022",
      "/ip4/127.0.0.1/tcp/4023/ws"
    ]
  },
  "Bootstrap": []
}
const peerB = new IPFS({
  repo: '/tmp/peerb',
  config: configB,
  init: {
    emptyRepo: true
  }
})
peerB.on('ready', () => {
  console.log('peerB ready')
})
