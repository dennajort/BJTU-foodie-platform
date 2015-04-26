var P = require("bluebird")

exports.register = function (server, options, next) {
  server.handler("generator", function(route, options) {
    return function(req, rep) {
      P.coroutine(options)(req, rep).catch(Error, function(err) {
        rep(err)
      }).catch(function(err) {
        rep(Error(err))
      })
    }
  })
  next()
}

exports.register.attributes = {
  name: "generator"
}
