var _ = require("lodash")

module.exports = function(server) {
  return _(require("requireindex")(__dirname)).values().map(function(f) {
    return f(server)
  }).value()
}
