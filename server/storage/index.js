var WebDavStorage = require("./webdavstorage")

exports.register = function(server, options, next) {
  server.expose("store", new WebDavStorage({
    username: "foodie",
    password: "foodie",
    url: "http://owncloud.dennajort.fr/remote.php/webdav/prod/"
  }))
  next()
}

exports.register.attributes = {
  name: "storage"
}
