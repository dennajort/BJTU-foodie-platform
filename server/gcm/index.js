"use strict"
var gcm  = require("node-gcm"),
  P = require("bluebird")

exports.register = function(server, options, next) {
  var sender = new gcm.Sender("AIzaSyB8yakUcRN68vxHfbxPh9-CfrvdfHn7u1A")
  var sendAsync = P.promisify(sender.send, sender)
  server.expose("send", sendAsync)
  next()
}

exports.register.attributes = {
  name: "gcm"
}
