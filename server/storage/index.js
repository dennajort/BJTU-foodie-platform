var WebDavStorage = require("./webdavstorage"),
  Joi = require("joi")

exports.register = function(server, options, next) {
  var url = "http://owncloud.dennajort.fr/remote.php/webdav/"
  if (process.env.NODE_ENV == "production") {
    url += "prod/"
  } else {
    url += "dev/"
  }

  var Storage = new WebDavStorage({
    username: "foodie",
    password: "foodie",
    url: url
  })

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
