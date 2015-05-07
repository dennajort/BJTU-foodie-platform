var WebDavStorage = require("./webdavstorage")

exports.register = function(server, options, next) {
  var url = "http://owncloud.dennajort.fr/remote.php/webdav/"
  if (process.env.NODE_ENV == "production") {
    url += "prod/"
  } else {
    url += "dev/"
  }
  server.expose("store", new WebDavStorage({
    username: "foodie",
    password: "foodie",
    url: url
  }))
  next()
}

exports.register.attributes = {
  name: "storage"
}
