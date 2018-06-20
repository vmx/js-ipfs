'use strict'

const Benchmark = require('benchmark')

const bench = new Benchmark('get the file', {
  defer: true,
  //fn: async (deferred) => {
  //  await peerB.files.get(inserted[0].hash)
  //  deferred.resolve()
  //}
  fn: function (deferred) {
    setTimeout(function() {
      deferred.resolve()
    }, 2000)
  }
})
const result = bench.run()
console.log('vmx: bench resilt:', result)
