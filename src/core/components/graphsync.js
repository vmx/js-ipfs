'use strict'

const pull = require('pull-stream')
// const pushable = require('pull-pushable')()
const whilst = require('async/whilst')

const CID = require('cids')
const ipldDagPb = require('ipld-dag-pb')
// Re-use the Bitswap message. Eventually Graphsync will probably have its own
// serialization
const BitswapMessage = require('ipfs-bitswap/src/types/message')
const GRAPHSYNC010 = '/ipfs/graphsync/0.1.0'

class Graphsync {
  constructor (libp2p, blockstore) {
    // Connection to other peers
    this._libp2p = libp2p

    // Local database
    this.blockstore = blockstore

  }

  start () {
    console.log('starting graphsync')

    this._libp2p.peerBook
      .getAllArray()
      .filter((peer) => {
        console.log('i am: peerid:', this._libp2p.peerInfo.id)
        console.log('peer in peerbook1:', peer)
        return peer.isConnected()
      })
      .forEach((peer) => {
        //this._onPeerConnect((peer))
        console.log('peer in peerbook2:', peer)
      })

    this._libp2p.handle(GRAPHSYNC010, async (protocol, conn) => {
      console.log('graphsync: connected', conn)

      // const allPeers = await this._libp2p.peerBook.getAllArray()
      // console.log('allpeers:', allPeers)

      // Make the connection pushable
      // pull(
      //   pushable,
      //   conn
      // )

      pull(
        // // Make the connection pushable
        // pushable,
        conn,
        pull.asyncMap((data, cb) => {
          console.log('vmx: graphsync-file: letssee')
          const cid = data.toString('utf8').replace('\n', '')
          console.log('ipfs components graphsync: cid:', cid)
          this._select({
            // The path to some value
            // Root hash in website repo
            //path: 'QmVCS2w81Maz8j5yDuSZtepvzJf6hqmpLYjkqsLyPPXM3H',
            // Hash of larger file (1mb)
            // path: 'QmdcjUT81ecpbCkYCfdNwpscwvryC8s6AMv9nGFCdwGWmM',
            // Hash of 10mb file
            // path: 'QmeXydTRiAcyBAFo3DbWSeTdHXA8ZzjvLb2moowRYbGin9',
            // Hash of 100mb file
            //path: 'QmQQXP1Zwp696PwdFqd5fL8LwvVkdR1AJuatJgioj4X3pz',
            path: cid,
            // If you want get a whole subtree, you can specifu which path to
            // follow.
            // If `follow` is an array, it expects all elements, except for the
            // last one to be arrays. It will then loop through all elements of such
            // an array and traverse them
            follow: ['Links', 'multihash'],
            maxDepth: 10000
          }, (result) => {
            const message = new BitswapMessage(false)
            result.forEach((block) => message.addBlock(block))
            // console.log('the nodes are: message:', message)
            cb(null, message.serializeToBitswap110())
          })

          // return 'Get subtree of: ' + data.toString('utf8').replace('\n', '')
        }),
        // pull.drain(console.log),
        // pull.onEnd(() => {
        //   console.log('ipfs: components: grpahsync: onend')
        // })
        // pull.drain()

        // Send the blocks back to the requestor
        conn
      )

      // console.log('vmx: ifps:graphsync: conn:', this._libp2p.close())

      // process.stdin.setEncoding('utf8')
      // process.openStdin().on('data', (chunk) => {
      //   console.log('vmx: stdin', chunk)
      //   var data = chunk.toString()
      //   pushable.push(data)
      // })
    })

    // this._libp2p.peerBook
    //   .getAllArray()
    //   .filter((peer) => {
    //     console.log('peer in peerbook1:', peer)
    //     return peer.isConnected()
    //   })
    //   .forEach((peer) => {
    //     //this._onPeerConnect((peer))
    //     console.log('peer in peerbook2:', peer)
    //   })

  }

  _select (selector, cb) {
    const blockstore = this.blockstore
    // Store nodes temporarily for easy traversal
    let nodes = []
    // NOTE vmx 2018-04-27: For now, just return the leaf nodes and not
    // the full subtree. If the subtree is returned decision need to be
    // made if it should be depth or breadth first.
    // NOTE vmx 2018-05-10: Change in plans, return them as unixfs is doing it
    // and return all nodes breadth first.
    const output = []
    // Paths always start with a CID
    // TODO vmx 2018-02-28: Is that actually true?
    const pathArray = selector.path.split('/')
    let cid = pathArray.shift()
    console.log('vmx: bitswap select cid:', cid)
    const path = pathArray.join('/')

    nodes.push(cid)

    // XXX 2018-04-17: GO ON HERE and don't serialize the node, but access the links directlt through the given path
    // Then traverse those
    whilst(
      function() {
        // console.log('whole condition:', nodes.length)
        return nodes.length > 0
      },
      function(callback) {
        blockstore.get(new CID(nodes[0]), (err, block) => {
          // Remove the node we just have processed
          cid = nodes.shift()
          // console.log('within loop: nodes.length:', nodes.length)
          // console.log('within loop: output.length:', output.length)
          //
          // console.log('vmx: bitwap: push block to output', block.cid.toBaseEncodedString())
          // // console.log('vmx: bitwap: push block to output: data', block.data.toString('hex'))
          // console.log('vmx: bitwap: push block to output: data length', block.data.length)
          // console.log('vmx: bitwap: push block to output: data tohextring length', block.data.toString('hex').length)

          // ipldDagPb.util.deserialize(block.data, (err, deserialized) => {
          //   console.log('vmx: bitwap: push block to output: deserialized data', deserialized)

            output.push(block)

            // Now we are at the end of the path, return the subtree if requested
            if (selector.follow) {
              if (Array.isArray(selector.follow)) {
                // TODO vmx 2018-04-27: Support an arbitrary number of array elements,
                // not just two
                // TODO vmx 2018-05-15: Optimize that you don't do another `get()` on the same
                // `CID` as before, just to get links of it
                // ipld.get(new CID(result.value.multihash), selector.follow[0], (err3, result3) => {
                ipldDagPb.resolver.resolve(block.data, selector.follow[0], (err3, result3) => {
                  if (err3) {
                    console.log('error3:', err3)
                    return err
                  }

                  for (const link of result3.value) {
                    console.log('pushing node with cid:', link[selector.follow[1]])
                    nodes.push(link[selector.follow[1]])
                  }

                  callback(null)
                })
              }
            }
          // })
        })
      },
      function (err, _n) {
        cb(output)
      }
    )
  }
}

module.exports = Graphsync
