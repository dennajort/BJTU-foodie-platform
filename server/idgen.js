"use strict"
var uuid = require('node-uuid')

exports.register = function(server, options, next) {
  server.expose("rand", function() {
    return uuid.v4({rng: uuid.nodeRNG})
  })
  next()
}

exports.register.attributes = {
  name: "idgen"
}
