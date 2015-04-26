var _ = require("lodash")

exports.register = function(server, options, next) {
  _.forIn(require("requireindex")(__dirname), function(part) {
    part(server)
  })
  next()
}

exports.register.attributes = {
  name: "api",
  dependencies: ["db", "oauth", "rest"]
}
