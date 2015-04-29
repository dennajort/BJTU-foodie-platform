var IStorage = require("./interface"),
  inherits = require("util").inherits,
  path = require("path"),
  P = require("bluebird"),
  fs = require("fs")

var LocalStorage = function(opts) {
  this._rootPath = opts.rootPath
  this._baseUri = "/static"
}

inherits(LocalStorage, IStorage)

LocalStorage.prototype.toUri = function(container, filename) {
  return `${this._baseUri}/${container}/${filename}`
}

LocalStorage.prototype.exists = function(container, filename) {
  return new P(function(resolve, reject) {
    var filePath = path.join(this._rootPath, container, filename)
    fs.access(filePath, fs.F_OK, function(err) {
      if (err) return resolve(false)
      resolve(true)
    })
  })
}

LocalStorage.prototype.remove = function(container, filename) {
  return new P(function(resolve, reject) {
    var filePath = path.join(this._rootPath, container, filename)
    fs.unlink(filePath, function(err) {
      resolve()
    })
  })
}

LocalStorage.prototype.createReadStream = function(container, filename) {
  return new P(function(resolve, reject) {
    var filePath = path.join(this._rootPath, container, filename)
    resolve(fs.createReadStream(filePath))
  })
}

LocalStorage.prototype.createWriteStream = function(container, filename) {
  return new P(function(resolve, reject) {
    var filePath = path.join(this._rootPath, container, filename)
    resolve(fs.createWriteStream(filePath))
  })
}
