"use strict"
var FlakeID = require("flake-idgen")

exports.register = function (server, options, next) {
  var fid = new FlakeID({
    worker: process.env.WORKER_ID || 0
  })

  server.expose("next", function(fn) {
    return fid.next(fn)
  })
  server.expose("format", require('biguint-format'))
  next()
}

exports.register.attributes = {
  name: "idgen"
}
