var P = require("bluebird"),
  Hapi = require("hapi"),
  Boom = require("boom")

module.exports = function loadServer() {
  var server = new Hapi.Server({
    connections: {routes: {cors: {origin: ["*"]}}}
  })

  server.connection({
    port: process.env.ELOVIZ_HTTP_PORT || 3000
  })

  function PLoad(plugins, options) {
    return function() {
      var opts = options || {}
      return new P(function(resolve, reject) {
        server.register(plugins, opts, function(err) {
          if (err) return reject(err)
          resolve(server)
        })
      })
    }
  }

  server.ext("onPostHandler", function(req, rep) {
    if (req.response instanceof Error && req.response.code == "E_VALIDATION") {
      var b = Boom.badRequest("Database validation error")
      b.output.payload.validation = {"keys": req.response.invalidAttributes}
      return rep(b)
    }

    rep.continue()
  })

  var p = PLoad([
    {
      register: require("good"),
      options: {
        reporters: [{
          reporter: require("good-console"),
          events: {log: "*", response: "*", request: "*", error: "*"}
        }]
      }
    },
    {
      register: require("dogwater"),
      options: {
        connections: {
          "db": {
            adapter: "sails-disk",
            filePath: "run/",
            fileName: "eloviz.db"
          }
        },
        adapters: {
          "sails-disk": require("sails-disk")
        },
        models: require("../models")
      }
    },
    {
      register: require("bedwetter"),
      options: {
        prefix: "/api",
        userIdProperty: "user.id"
      }
    },
    require("./handlers"),
    require("./oauth")
  ])()
  .then(PLoad(
    require("../api"),
    {routes: {prefix: "/api"}}
  ))

  if (process.env.NODE_ENV == "development") p = p.then(PLoad(require("blipp")))
  if (process.env.NODE_ENV != "test") p = p.then(PLoad(require("./swagger")))

  return p
}
