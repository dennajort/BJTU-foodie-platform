"use strict"
// jshint unused:false
var P = require("bluebird"),
  Boom = require("boom"),
  inherits = require("util").inherits

function NotFound() {
  Error.call(this)
  this.name = "NotFound"
}

inherits(NotFound, Error)

function IStorage() {}

IStorage.NotFound = NotFound

IStorage.prototype.makeUrl = function(name, file) {
  return `/storage/${name}/${file}`
}

IStorage.prototype.getContainers = function() {
  throw new Error("Not implemented")
}

IStorage.prototype.getContainer = function(name) {
  throw new Error("Not implemented")
}

IStorage.prototype.createContainer = function(name) {
  throw new Error("Not implemented")
}

IStorage.prototype.destroyContainer = function(name) {
  throw new Error("Not implemented")
}

IStorage.prototype.getFile = function(name, file) {
  throw new Error("Not implemented")
}

IStorage.prototype.getFiles = function(name) {
  throw new Error("Not implemented")
}

IStorage.prototype.removeFile = function(name, file) {
  throw new Error("Not implemented")
}

IStorage.prototype.download = function(name, file, rep) {
  return this.downloadStream(name, file).then(function(stream) {
    rep(stream)
  }).catch(NotFound, function() {
    throw Boom.notFound()
  })
}

IStorage.prototype.downloadStream = function(name, file) {
  throw new Error("Not implemented")
}

IStorage.prototype.upload = function(name, file, stream) {
  return this.uploadStream(name, file).then(function(out) {
    return new P(function(resolve, reject) {
      stream.pipe(out)
      out.on("finish", function() {resolve()})
      out.on("error", function(err) {reject(err)})
    })
  })
}

IStorage.prototype.uploadStream = function(name, file) {
  throw new Error("Not implemented")
}

module.exports = IStorage
