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

const peerBPromise = new Promise((resolve) => {
  const config = {
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
  const peer = new IPFS({
    repo: '/tmp/peerb',
    config: config,
    init: {
      emptyRepo: true
    }
  })
  peer.on('ready', () => {
    console.log('peerB ready')
    resolve(peer)
  })
})

const connectPeers = async (peerA, peerB) => {
  try {
    const peerAId = await peerA.id()
    return peerB.swarm.connect(peerAId.addresses[0])
  } catch (err) {
    console.error(err)
  }
}

const main = async () => {
  try {
    const peerA = await peerAPromise
    const peerB = await peerBPromise

    await connectPeers(peerA, peerB)
    console.log('vmx: connected')

    const fileStream = fs.createReadStream('/tmp/100m.data')
    const inserted = await peerB.files.add(fileStream)
    console.log('vmx: inserted:', inserted)
    //
    //
    // const start = process.hrtime();
    // await peerB.files.cat(inserted[0].hash)
    // 10mb
    // const theFile = await peerB.files.cat('Qme79eYSxpXhhwr6bu6ZSnWJR9rnBFdYAC9hhYohRx6e35')
    // 100mb
    const theFile = await peerB.files.cat('QmdCSAR8F2thsX7hUL2hKDbBmBmHf9tzNTBHmHRwcxxRBC')
    // const end = process.hrtime(start);
    // console.log('It took:', prettyHrtime(end))

    console.log('got the file:', theFile)
    fs.writeFileSync('/tmp/unixfsoutpropergraphsync.dat', theFile)

    // peerA.stop()
    // peerB.stop()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}


main()
