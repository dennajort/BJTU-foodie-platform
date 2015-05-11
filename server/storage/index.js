"use strict"
var Joi = require("joi"),
  path = require("path")

exports.register = function(server, options, next) {
  var Storage = (function(env) {
    if (env == "production") {
      return new (require("./webdavstorage"))({
        username: "foodie",
        password: "foodie",
        url: "http://owncloud.dennajort.fr/remote.php/webdav/prod/"
      })
    } else {
      return new (require("./localstorage"))({
        path: path.join(__dirname, "..", "..", "run", "uploads")
      })
    }
  })(process.env.NODE_ENV)

  server.expose("store", Storage)

  server.route({
    method: "GET",
    path: "/storage/{container}/{filename}",
    config: {
      validate: {
        params: {
          container: Joi.string().required(),
          filename: Joi.string().required()
        }
      },
      plugins: {swagger: false},
      handler: function(req, rep) {
        Storage.download(req.params.container, req.params.filename, rep).catch(rep)
      }
    }
  })

  next()
}

exports.register.attributes = {
  name: "storage"
}
