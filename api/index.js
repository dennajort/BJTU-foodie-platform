var _ = require("lodash")

exports.register = function(server, options, done) {
  server.dependency(["dogwater"], function(server, next) {
    _.forIn(require("requireindex")(__dirname), function(part) {
      part(server)
    })
    next()
  })
  done()
}

exports.register.attributes = {
  name: "api",
  dependencies: ["dogwater", "oauth", "bedwetter"]
}
