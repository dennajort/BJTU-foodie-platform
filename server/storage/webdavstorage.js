"use strict"
var IStorage = require("./interface"),
  inherits = require("util").inherits,
  request = require("request"),
  P = require("bluebird"),
  DOMParser = require("xmldom").DOMParser,
  _ = require("lodash"),
  url = require("url"),
  Boom = require("boom"),
  PassThrough = require("stream").PassThrough

function WebDavStorage(opts) {
  this._req = request.defaults({
    baseUrl: opts.url,
    gzip: true,
    auth: {
      username: opts.username,
      password: opts.password,
      sendImmediately: true
    }
  })
  this._basePath = url.parse(opts.url).pathname
  if (this._basePath.endsWith("/")) this._basePath = this._basePath.slice(0, -1)
}

inherits(WebDavStorage, IStorage)

WebDavStorage.prototype._relPath = function(p) {
  return p.slice(this._basePath.length)
}

WebDavStorage.prototype.getContainers = function() {
  var self = this
  return new P(function(resolve, reject) {
    self._req({
      method: "PROPFIND",
      uri: "/",
      headers: {Depth: 1}
    }, function(err, res, data) {
      if (err) return reject(err)
      var root = new DOMParser().parseFromString(data).documentElement,
        responses = root.getElementsByTagNameNS("DAV:", "response")
      resolve(_(responses).map(function(res) {
        var href = self._relPath(res.getElementsByTagNameNS("DAV:", "href")[0].childNodes[0].nodeValue),
          prop = res.getElementsByTagNameNS("DAV:", "propstat")[0].getElementsByTagNameNS("DAV:", "prop")[0],
          isCol = prop.getElementsByTagNameNS("DAV:", "resourcetype")[0].getElementsByTagNameNS("DAV:", "collection").length == 1
        return {href: href, isCol: isCol}
      }).filter(function(res) {
        return res.isCol && res.href != "/"
      }).map(function(res) {
        return res.href.slice(1, -1)
      }).value())
    })
  })
}

WebDavStorage.prototype.createContainer = function(name) {
  var self = this
  return new P(function(resolve, reject) {
    self._req({
      method: "HEAD",
      uri: "/" + name
    }, function(err, res) {
      if (res.statusCode == 200) return resolve(true)
      self._req({
        method: "MKCOL",
        uri: "/" + name
      }, function(err, res) {
        if (err) return reject(err)
        switch (res.statusCode) {
          case 201: case 200: return resolve(false)
          default: return reject()
        }
      })
    })
  })
}

WebDavStorage.prototype._metaRemove = function(uri) {
  var self = this
  return new P(function(resolve, reject) {
    self._req({
      method: "DELETE",
      uri: uri
    }, function(err, res) {
      if (err) return reject(err)
      switch (res.statusCode) {
        case 204: case 404: return resolve()
        default: return reject()
      }
    })
  })
}

WebDavStorage.prototype.destroyContainer = function(name) {
  return this._metaRemove("/" + name)
}

WebDavStorage.prototype.removeFile = function(name, file) {
  return this._metaRemove("/" + name + "/" + file)
}

WebDavStorage.prototype.download = function(name, file, rep) {
  return this.downloadStream(name, file).then(function(stream) {
    rep(stream)
  }).catch(function(err) {
    if (err == 404) throw Boom.notFound()
    throw err
  })
}

WebDavStorage.prototype.downloadStream = function(name, file) {
  var self = this
  return new P(function(resolve, reject) {
    var dup = new PassThrough()
    self._req({
      method: "GET",
      uri: "/" + name + "/" + file
    }).on("response", function(res) {
      if (res.statusCode == 200) return resolve(dup)
      reject(res.statusCode)
    }).on("error", function(err) {
      return reject(err)
    }).pipe(dup)
  })
}

WebDavStorage.prototype.upload = function(name, file, stream) {
  return this.uploadStream(name, file).then(function(out) {
    return new P(function(resolve, reject) {
      stream.pipe(out)
      out.on("finish", function() {
        resolve()
      })
      out.on("error", function() {
        reject()
      })
    })
  })
}

WebDavStorage.prototype.uploadStream = function(name, file) {
  var dup = new PassThrough()
  dup.pipe(this._req({
    method: "PUT",
    uri: "/" + name + "/" + file
  }))
  return P.resolve(dup)
}

module.exports = WebDavStorage
