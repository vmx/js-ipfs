'use strict'

const fs = require('fs')

const prettyHrtime = require('pretty-hrtime')

const IPFS = require('ipfs')


const peerAPromise = new Promise((resolve) => {
  const config = {
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
  const peer = new IPFS({
    repo: '/tmp/peera',
    config: config,
    init: {
      emptyRepo: true
    }
  })
  peer.on('ready', () => {
    console.log('peerA ready')
    resolve(peer)
  })
})

const main = async () => {
  try {
    const peerA = await peerAPromise

    const fileStream = fs.createReadStream('/tmp/100m.data')
    console.log('filsestream:', fileStream)
    const inserted = await peerA.files.add(fileStream)
    console.log('vmx: inserted:', inserted)

    // const cid = 'Qme79eYSxpXhhwr6bu6ZSnWJR9rnBFdYAC9hhYohRx6e35'
    // const contents = await peerA.files.cat(cid)
    // console.log('vmx: got file:', contents.length)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}


main()
