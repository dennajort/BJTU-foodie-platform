"use strict"
function IStorage() {}

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
  throw new Error("Not implemented")
}

IStorage.prototype.downloadStream = function(name, file) {
  throw new Error("Not implemented")
}

IStorage.prototype.upload = function(name, file, stream) {
  throw new Error("Not implemented")
}

IStorage.prototype.uploadStream = function(name, file) {
  throw new Error("Not implemented")
}

module.exports = IStorage
