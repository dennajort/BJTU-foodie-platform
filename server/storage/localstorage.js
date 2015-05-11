"use strict"
var IStorage = require("./interface"),
  inherits = require("util").inherits,
  fs = require("fs"),
  P = require("bluebird"),
  path = require("path"),
  _ = require("lodash")

var readDirAsync = P.promisify(fs.readdir),
  statAsync = P.promisify(fs.stat),
  mkdirAsync = P.promisify(fs.mkdir),
  unlinkAsync = P.promisify(fs.unlink)

function LocalStorage(opts) {
  this._path = path.resolve(opts.path)
  mkdirAsync(this._path).catch(function(err) {
    if (err.code != "EEXIST") throw err
  })
}

inherits(LocalStorage, IStorage)

LocalStorage.prototype.getContainers = P.method(function() {
  return readDirAsync(this._path).bind(this).map(function(file) {
    return statAsync(path.join(this._path, file)).then(function(stats) {
      return {name: file, stats: stats}
    })
  }).filter(_.method("stats.isDirectory")).map(_.property("name"))
})

LocalStorage.prototype.createContainer = P.method(function(name) {
  return mkdirAsync(path.join(this._path, name)).then(function() {
    return false
  }).catch(function(err) {
    if (err.code == "EEXIST") return true
    throw err
  })
})

LocalStorage.prototype.destroyContainer = P.method(function(name) {
  return unlinkAsync(path.join(this._path, name))
})

LocalStorage.prototype.removeFile = P.method(function(name, file) {
  return unlinkAsync(path.join(this._path, name, file))
})

LocalStorage.prototype.downloadStream = P.method(function(name, file) {
  return fs.createReadStream(path.join(this._path, name, file))
})

LocalStorage.prototype.uploadStream = P.method(function(name, file) {
  return fs.createWriteStream(path.join(this._path, name, file))
})

module.exports = LocalStorage
