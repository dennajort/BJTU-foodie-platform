var _ = require("lodash")

exports.register = function (server, options, next) {
  server.register(_.values(require("requireindex")(__dirname)), next)
}

exports.register.attributes = {
  name: "handlers"
}
